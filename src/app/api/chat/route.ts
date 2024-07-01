import { Configuration, OpenAIApi } from "openai-edge";
import { Message, OpenAIStream, StreamingTextResponse } from "ai";
import { getContext } from "@/lib/context";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// interface OpenAIResponse {
//   openai: {
//     status: string;
//     generated_text: string;
//     message: Message[];
//     cost: number;
//   };
// }

export const runtime = "edge";

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export async function POST(req: Request) {
  try {
    const { messages, chatId } = await req.json();
    console.log("Given Message ", messages);
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];
    const text: string = messages[messages.length - 1].content;
    console.log("Text = ", text);
    const context = await getContext(lastMessage.content, fileKey);

    const prompt = {
      role: "system",
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `,
    };

    // const response = await openai.createChatCompletion({
    //   model: "gpt-3.5-turbo",
    //   messages: [
    //     prompt,
    //     ...messages.filter((message: Message) => message.role === "user"),
    //   ],
    //   stream: true,
    // });

    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2ExYzYwOTUtMjBiOC00ZDA5LWJhZDktMjZhZDA1MDYyNjU4IiwidHlwZSI6ImFwaV90b2tlbiJ9.yQd9PPJkCoLIT0pQTkRBzJn57s4VE_jfDASsrpviCCc
        // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDQ2MjFjZWMtNDkyYi00MDIxLTgzNjQtOTg0ODE1MDY4MTVlIiwidHlwZSI6ImFwaV90b2tlbiJ9.mUopLvdWXw19V6afLRURVYdz4cD6Kla9vCmAnFfj9Xg
        authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2ExYzYwOTUtMjBiOC00ZDA5LWJhZDktMjZhZDA1MDYyNjU4IiwidHlwZSI6ImFwaV90b2tlbiJ9.yQd9PPJkCoLIT0pQTkRBzJn57s4VE_jfDASsrpviCCc'
      },
      body: JSON.stringify({
        settings: '{"openai":"gpt-4"}',
        response_as_dict: true,
        attributes_as_list: false,
        show_original_response: false,
        temperature: 0,
        max_tokens: 1000,
        providers: 'openai',
        chatbot_global_action: prompt.content,
        text: text,
      })
    };

    const response = await fetch('https://api.edenai.run/v2/text/chat', options);
    const result = await response.json();
    console.log("result = ", result);
    const newMessage={
      role:"assistant",
      content: result.openai.generated_text
    }
    
    messages.push(newMessage);

    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });

    await db.insert(_messages).values({
      chatId,
      content: result.openai.generated_text,
      role: "system",
    });

    // const newMessage={
    //   role:result.openai.message[1].role,
    //   content:result.openai.message[1].message,
    // }
    // messages.push(newMessage);
    // console.log("New Message ",messages);

    // const stream = OpenAIStream(result, {
    //   onStart: async () => {
    //     // save user message into db
    //     await db.insert(_messages).values({
    //       chatId,
    //       content: lastMessage.content,
    //       role: "user",
    //     });
    //   },
    //   onCompletion: async (completion) => {
    //     // save ai message into db
    //     await db.insert(_messages).values({
    //       chatId,
    //       content: completion,
    //       role: "system",
    //     });
    //   },
    // });
    // return new StreamingTextResponse(stream);
    if(result.openai.generated_text){
      return NextResponse.json({
        gen:result.openai.generated_text,
        // status:true,
      })
    }
  } catch (error) {
    console.log("error in chat stream", error);
  }
}
