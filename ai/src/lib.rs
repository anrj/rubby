use openai_api_rs::v1::{
    api::OpenAIClient,
    chat_completion::{ChatCompletionMessage, ChatCompletionRequest, Content, MessageRole},
};
use std::env;
use std::error::Error;

const MODEL_ID: &str = "qwen-3-235b-a22b-instruct-2507";
// const MODEL_ID: &str = "gpt-oss-120b";
const API_ENDPOINT: &str = "https://api.cerebras.ai/v1";
const SYSTEM_PROMPT: &str = include_str!("system_prompt.txt");

const MAX_RECENT_MESSAGES: usize = 8;
const SUMMARIZE_THRESHOLD: usize = 16;

pub struct RubbyAI {
    client: OpenAIClient,
    model: String,
    messages: Vec<ChatCompletionMessage>,
    has_summary: bool,
}

impl RubbyAI {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        dotenvy::dotenv().ok(); 

        let api_key = env::var("CEREBRAS_API_KEY")
            .map_err(|_| "CEREBRAS_API_KEY environment variable not set")?;

        let client = OpenAIClient::builder()
            .with_endpoint(API_ENDPOINT)
            .with_api_key(api_key)
            .build()?;

        let messages = vec![ChatCompletionMessage {
            role: MessageRole::system,
            content: Content::Text(SYSTEM_PROMPT.to_string()),
            name: None,
            tool_calls: None,
            tool_call_id: None,
        }];

        Ok(Self {
            client,
            model: MODEL_ID.to_string(),
            messages,
            has_summary: false,
        })
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

        let mut req = ChatCompletionRequest::new(
            self.model.clone(), 
            self.messages.clone() 
        );
        
        // Model configuration
        req.max_tokens = Some(67);
        req.temperature = Some(0.3);
        req.top_p = Some(0.9);
        
        let result = self.client.chat_completion(req).await?;

        let content = result.choices.first()
            .and_then(|c| c.message.content.as_ref())
            .ok_or("Model returned empty response")?
            .to_string();

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
        
        let mut req = ChatCompletionRequest::new(
            self.model.clone(),
            summarization_messages,
        );
        
        req.temperature = Some(0.3);
        req.top_p = Some(0.9);
        
        let result = self.client.chat_completion(req).await?;
        let summary = result.choices.first()
            .and_then(|c| c.message.content.as_ref())
            .ok_or("Failed to generate summary")?
            .to_string();
        
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
