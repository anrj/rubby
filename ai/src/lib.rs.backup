use openai_api_rs::v1::{
    api::OpenAIClient,
    chat_completion::{ChatCompletionMessage, ChatCompletionRequest, Content, MessageRole},
};
use serde_json::Value;

const SOCRATIC_SYSTEM_PROMPT: &str = include_str!("qwen_prompt.txt");

pub async fn run_chat(prompt: &str) -> Result<Value, Box<dyn std::error::Error>> {
    dotenvy::from_path("../.env").ok();
    let base_url = "https://api.cerebras.ai/v1";
    let token = std::env::var("CEREBRAS_API_KEY")?;
    let model = "qwen-3-235b-a22b-instruct-2507";

    let mut client = OpenAIClient::builder()
        .with_endpoint(base_url)
        .with_api_key(token)
        .build()?;

    let messages = vec![
        ChatCompletionMessage {
            role: MessageRole::system,
            content: Content::Text(SOCRATIC_SYSTEM_PROMPT.to_string()),
            name: None,
            tool_calls: None,
            tool_call_id: None,
        },
        ChatCompletionMessage {
            role: MessageRole::user,
            content: Content::Text(prompt.to_string()),
            name: None,
            tool_calls: None,
            tool_call_id: None,
        },
    ];

    let mut req = ChatCompletionRequest::new(model.to_string(), messages);
    req.max_tokens = Some(120);
    req.temperature = Some(0.3);
    req.top_p = Some(0.9);

    let res = client.chat_completion(req).await?;
    let json = serde_json::to_value(&res)?;

    Ok(json)
}
