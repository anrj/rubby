use openai_api_rs::v1::{
    api::OpenAIClient,
    chat_completion::{ChatCompletionMessage, ChatCompletionRequest, Content, MessageRole},
};
use std::env;
use std::error::Error;

const MODEL_ID: &str = "qwen-3-235b-a22b-instruct-2507";
const API_ENDPOINT: &str = "https://api.cerebras.ai/v1";
const SYSTEM_PROMPT: &str = include_str!("qwen_prompt.txt");
const MAX_HISTORY: usize = 21; 

pub struct RubbyAI {
    client: OpenAIClient,
    model: String,
    messages: Vec<ChatCompletionMessage>,
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
        
        if self.messages.len() > MAX_HISTORY {
           let excess = self.messages.len() - MAX_HISTORY;
           let to_remove = if excess % 2 != 0 { excess + 1 } else { excess };
           
           self.messages.drain(1..1 + to_remove);
        }

        let mut req = ChatCompletionRequest::new(
            self.model.clone(), 
            self.messages.clone() 
        );
        
        req.max_tokens = Some(240); 
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
}