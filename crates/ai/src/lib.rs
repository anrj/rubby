use openai_api_rs::v1::chat_completion::{ChatCompletionMessage, Content, MessageRole};
use serde::Deserialize;
use std::env;
use std::error::Error;

const MODEL_ID: &str = "gpt-oss-120b";
const API_ENDPOINT: &str = "https://api.cerebras.ai/v1/chat/completions";
const SYSTEM_PROMPT: &str = include_str!("system_prompt.txt");

const MAX_RECENT_MESSAGES: usize = 8;
const SUMMARIZE_THRESHOLD: usize = 16;

// gpt-oss-120b is a reasoning model. By default it emits chain-of-thought into
// `content` (which would land in the chat bubble) and those tokens count against
// the completion budget. We send `reasoning_effort: low` to keep latency/cost
// down and `reasoning_format: parsed` so reasoning goes to a separate field we
// ignore, leaving `content` as the clean final answer.
const REASONING_EFFORT: &str = "low";
const REASONING_FORMAT: &str = "parsed";

// Headroom for the (now small) reasoning trace plus the short final reply.
const CHAT_MAX_TOKENS: u32 = 1024;
const SUMMARY_MAX_TOKENS: u32 = 1024;

#[derive(Deserialize)]
struct ChatResponse {
    choices: Vec<Choice>,
}

#[derive(Deserialize)]
struct Choice {
    message: ResponseMessage,
}

#[derive(Deserialize)]
struct ResponseMessage {
    content: Option<String>,
}

pub struct RubbyAI {
    client: reqwest::Client,
    api_key: String,
    model: String,
    messages: Vec<ChatCompletionMessage>,
    has_summary: bool,
}

impl RubbyAI {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        dotenvy::dotenv().ok();

        let api_key = env::var("CEREBRAS_API_KEY")
            .map_err(|_| "CEREBRAS_API_KEY environment variable not set")?;

        let messages = vec![ChatCompletionMessage {
            role: MessageRole::system,
            content: Content::Text(SYSTEM_PROMPT.to_string()),
            name: None,
            tool_calls: None,
            tool_call_id: None,
        }];

        Ok(Self {
            client: reqwest::Client::new(),
            api_key,
            model: MODEL_ID.to_string(),
            messages,
            has_summary: false,
        })
    }

    /// Raw chat-completions call. We bypass the openai-api-rs request builder
    /// because it can't set Cerebras's `reasoning_effort` / `reasoning_format`
    /// fields, which gpt-oss-120b needs to behave. `ChatCompletionMessage`
    /// still serializes to valid OpenAI-format messages.
    async fn complete(
        &self,
        messages: &[ChatCompletionMessage],
        max_tokens: u32,
    ) -> Result<String, Box<dyn Error>> {
        let body = serde_json::json!({
            "model": self.model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.3,
            "top_p": 0.9,
            "reasoning_effort": REASONING_EFFORT,
            "reasoning_format": REASONING_FORMAT,
        });

        let response = self
            .client
            .post(API_ENDPOINT)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&body)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(format!("Cerebras API error: {}", error_text).into());
        }

        let parsed: ChatResponse = response.json().await?;
        let content = parsed
            .choices
            .first()
            .and_then(|c| c.message.content.clone())
            .filter(|c| !c.is_empty())
            .ok_or("Model returned empty response")?;

        Ok(content)
    }

    pub async fn chat(&mut self, prompt: &str) -> Result<String, Box<dyn Error>> {
        self.messages.push(ChatCompletionMessage {
            role: MessageRole::user,
            content: Content::Text(prompt.to_string()),
            name: None,
            tool_calls: None,
            tool_call_id: None,
        });

        if self.messages.len() > SUMMARIZE_THRESHOLD + 1 {
            self.summarize().await?;
        }

        let content = self.complete(&self.messages, CHAT_MAX_TOKENS).await?;

        self.messages.push(ChatCompletionMessage {
            role: MessageRole::assistant,
            content: Content::Text(content.clone()),
            name: None,
            tool_calls: None,
            tool_call_id: None,
        });

        Ok(content)
    }

    async fn summarize(&mut self) -> Result<(), Box<dyn Error>> {
        let total_messages = self.messages.len();
        let recent_start_idx = total_messages.saturating_sub(MAX_RECENT_MESSAGES);
        
        // Check for existing summary
        let mut old_messages_start = 1;
        let mut previous_summary = None;
        
        if self.has_summary {
            // If we have a summary, it's at index 1. Capture it!
            if let Content::Text(text) = &self.messages[1].content {
                previous_summary = Some(text.clone());
            }
            old_messages_start = 2; // Skip the old summary message in the slice
        }
        
        let messages_to_summarize: Vec<ChatCompletionMessage> = 
            self.messages[old_messages_start..recent_start_idx].to_vec();
        
        if messages_to_summarize.is_empty() {
            return Ok(());
        }
        
        // Pass previous summary to the prompt builder
        let summary_prompt = self.summary_prompt(&messages_to_summarize, previous_summary.as_deref());
        
        let summarization_messages = vec![
            ChatCompletionMessage {
                role: MessageRole::system,
                content: Content::Text(
                    "You are a conversation summarizer. Update the summary to include the new messages. \
                    Keep the total summary concise (under 200 words) but preserve key context from the start."
                        .to_string()
                ),
                name: None,
                tool_calls: None,
                tool_call_id: None,
            },
            ChatCompletionMessage {
                role: MessageRole::user,
                content: Content::Text(summary_prompt),
                name: None,
                tool_calls: None,
                tool_call_id: None,
            },
        ];
        
        let summary = self
            .complete(&summarization_messages, SUMMARY_MAX_TOKENS)
            .await?;

        // Build new message list
        let mut new_messages = vec![self.messages[0].clone()]; // Keep System Prompt
        
        // Add updated summary
        new_messages.push(ChatCompletionMessage {
            role: MessageRole::system,
            content: Content::Text(format!("{}\n{}", "[CONVERSATION SUMMARY]", summary)),
            name: None,
            tool_calls: None,
            tool_call_id: None,
        });
        
        // Add recent messages
        new_messages.extend_from_slice(&self.messages[recent_start_idx..]);
        
        self.messages = new_messages;
        self.has_summary = true;
        
        Ok(())
    }
    
    fn summary_prompt(&self, messages: &[ChatCompletionMessage], previous_summary: Option<&str>) -> String {
        let mut prompt = String::new();
        
        // Inject previous summary if it exists
        if let Some(prev) = previous_summary {
            prompt.push_str("EXISTING SUMMARY:\n");
            // Strip the marker if present to avoid duplication
            let clean_prev = prev.replace("[CONVERSATION SUMMARY]\n", "");
            prompt.push_str(&clean_prev);
            prompt.push_str("\n\nNEW MESSAGES TO INCORPORATE:\n");
        } else {
            prompt.push_str("Summarize this conversation:\n\n");
        }
        
        for (i, msg) in messages.iter().enumerate() {
            let role = match msg.role {
                MessageRole::user => "User",
                MessageRole::assistant => "Assistant",
                MessageRole::system => "System",
                _ => "Unknown",
            };
            
            if let Content::Text(text) = &msg.content {
                prompt.push_str(&format!("{}. {}: {}\n", i + 1, role, text));
            }
        }
        
        prompt.push_str("\nProvide a single updated summary that merges the old context with these new developments.\n");
        
        prompt
    }
}
