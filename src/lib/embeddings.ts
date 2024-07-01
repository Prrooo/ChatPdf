// import { OpenAIApi, Configuration } from "openai-edge";


// const config = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(config);

// export async function getEmbeddings(text: string) {
//   try {
//     const response = await openai.createEmbedding({
//       model: "text-embedding-ada-002",
//       input: text.replace(/\n/g, " "),
//     });
//     const result = await response.json();
//     return result.data[0].embedding as number[];
//   } catch (error) {
//     console.log("error calling openai embeddings api", error);
//     throw error;
//   }
// }


// import { OpenAIApi, Configuration } from "openai-edge";

// const config = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const openai = new OpenAIApi(config);

// export async function getEmbeddings(text: string) {
//   try {
//     const response = await openai.createEmbedding({
//       model: "text-embedding-3-small",
//       input: text.replace(/\n/g, " "),
//     });
//     console.log("response",response);
//     const result = await response.json();
//     console.log("result",result);

//     // Check if result.data is defined and not empty
//     if (result.data && result.data.length > 0) {
//       return result.data[0].embedding as number[];
//     } else {
//       throw new Error("No embeddings data found in the API response");
//     }
//   } catch (error) {
//     console.log("Error calling OpenAI embeddings API:", error);
//     throw error;
//   }
// }


export async function getEmbeddings(text: string) {
  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDQ2MjFjZWMtNDkyYi00MDIxLTgzNjQtOTg0ODE1MDY4MTVlIiwidHlwZSI6ImFwaV90b2tlbiJ9.mUopLvdWXw19V6afLRURVYdz4cD6Kla9vCmAnFfj9Xg
      authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiM2ExYzYwOTUtMjBiOC00ZDA5LWJhZDktMjZhZDA1MDYyNjU4IiwidHlwZSI6ImFwaV90b2tlbiJ9.yQd9PPJkCoLIT0pQTkRBzJn57s4VE_jfDASsrpviCCc'
    },
    body: JSON.stringify({
      settings: '{"openai":"1536__text-embedding-ada-002"}',
      response_as_dict: true,
      attributes_as_list: false,
      show_original_response: false,
      texts: [text],
      providers: 'openai'
    })
  };

  // const response=fetch('https://api.edenai.run/v2/text/embeddings', options)
  //   .then(response => response.json())
  //   .then(response => console.log(response))
  //   .catch(err => console.error(err));
  // const response=await fetch('https://api.edenai.run/v2/text/embeddings',options);
  try {
    const response = await fetch('https://api.edenai.run/v2/text/embeddings', options);
    const result = await response.json();
    // console.log("result", result);

    // Check if result.data is defined and not empty
    if (result.openai.items && result.openai.items.length > 0) {
      return result.openai.items[0].embedding as number[];
    } else {
      throw new Error("No embeddings data found in the API response");
    }
  } catch (error) {
    console.log("Error calling OpenAI embeddings API:", error);
    throw error;
  }
}
