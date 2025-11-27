use openai_api_rs::v1::{
    api::OpenAIClient,
    chat_completion::{ChatCompletionMessage, ChatCompletionRequest, Content, MessageRole},
};
use std::io::{self, Write};
use io::{stdin, stdout};

const SOCRATIC_SYSTEM_PROMPT: &str = include_str!("qwen_prompt.txt");

#[tokio::main]
pub async fn main() {
    dotenvy::from_path("../.env").ok();
    
    println!("🦆 Rubby - Socratic Learning Companion");
    println!("Powered by Qwen3 235B Thinking via Cerebras Direct API\n ");
    
    let base_url = "https://api.cerebras.ai/v1";
    let token = std::env::var("CEREBRAS_API_KEY")
        .expect("CEREBRAS_API_KEY not set. Get yours at: https://cloud.cerebras.ai/");
    
    let mut client = OpenAIClient::builder()
        .with_endpoint(base_url)
        .with_api_key(token)
        .build()
        .expect("Could not create OpenAI client");
    
    // - "qwen-3-235b-a22b-instruct-2507" - 235B params, 65K context
    // - "qwen-3-32b" - 32B params, 65K context, hybrid reasoning
    // - "llama-3.3-70b" - 65K context
    //
    // - "qwen-3-235b-a22b-thinking-2507" - paid
    
    let model = "qwen-3-235b-a22b-instruct-2507";
    
    println!("Using: {}", model);
    
    let mut messages: Vec<ChatCompletionMessage> = vec![
        ChatCompletionMessage {
            role: MessageRole::system,
            content: Content::Text(SOCRATIC_SYSTEM_PROMPT.to_string()),
            name: None,
            tool_calls: None,
            tool_call_id: None,
        }
    ];
    
    loop {
        print!("\n> ");
        stdout().flush().unwrap();
        
        let mut user_input = String::new();
        stdin().read_line(&mut user_input).expect("Failed to read input");
        let user_input = user_input.trim();
        
        if user_input.is_empty() {
            continue;
        }
        
        if user_input.eq_ignore_ascii_case("exit") || user_input.eq_ignore_ascii_case("quit") {
            println!("Happy learning! 🦆");
            break;
        }
        
        // Add user message
        messages.push(ChatCompletionMessage {
            role: MessageRole::user,
            content: Content::Text(user_input.to_string()),
            name: None,
            tool_calls: None,
            tool_call_id: None,
        });
        
        // Create request with parameters optimized for Qwen Instruct
        let mut req = ChatCompletionRequest::new(model.to_string(), messages.clone());
        
        // For Socratic teaching with Qwen Instruct:
        req.max_tokens = Some(120);
        req.temperature = Some(0.3);
        req.top_p = Some(0.9);
        
        // Send request
        match client.chat_completion(req).await {
            Ok(response) => {
                if let Some(choice) = response.choices.first() {
                    if let Some(content) = choice.message.content.as_ref() {
                        println!("\n🦆 {}", content.trim());
                        
                        messages.push(ChatCompletionMessage {
                            role: MessageRole::assistant,
                            content: Content::Text(content.to_string()),
                            name: None,
                            tool_calls: None,
                            tool_call_id: None,
                        });
                    } else {
                        println!("❌ No content received");
                    }
                } else {
                    println!("❌ No response received");
                }
            }
            Err(e) => {
                println!("❌ Error: {}", e);
                messages.pop();
            }
        }
        
        // Keep conversation history manageable (last 10 exchanges + system)
        // TODO: Implement context window methods for better history management
        if messages.len() > 21 {
            let system_msg = messages.remove(0);
            messages.drain(0..2);
            messages.insert(0, system_msg);
        }
    }
}