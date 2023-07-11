import { process } from '/env'
import { Configuration, OpenAIApi } from 'openai'

const setupTextarea = document.getElementById('setup-textarea')
const setupInputContainer = document.getElementById('setup-input-container')
const movieBossText = document.getElementById('movie-boss-text')
const sendBtn = document.getElementById("send-btn");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

sendBtn.addEventListener("click", () => {
  submitPitch();
})

setupTextarea.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    submitPitch();
  }
});

function submitPitch() {
  if (setupTextarea.value) {
    const userInput = setupTextarea.value
    setupInputContainer.innerHTML = `<img src="images/loading.svg" class="loading" id="loading">`
    movieBossText.innerText = `Ok, just wait a second while my digital brain digests that...`
    fetchBotReply(userInput)
    fetchSynopsis(userInput)
  }
}

async function fetchBotReply(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a short message to enthusiastically say that an outline sounds interesting and that you need a moment to think about it.
    ###
    outline: Two dogs fall in love and move to Hawaii to learn to surf.
    message: I'll need to think about that. But your idea is amazing! I love the bit about Hawaii!
    ###
    outline: A plane crashes in the jungle and the passengers have to walk 1000km to safety.
    message: I'll spend a few moments considering that. But I love your idea!! A disaster movie in the jungle!
    ###
    outline: A group of corrupt lawyers try to send an innocent woman to jail.
    message: Wow that is awesome! Corrupt lawyers, huh? Give me a few moments to think!
    ###
    outline: "${outline}"
    message:
    `,
    max_tokens: 60
  })
  movieBossText.innerText = response.data.choices[0].text.trim()
  console.log(response)
}

async function fetchSynopsis(outline) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate an engaging, professional and marketable movie synopsis based on an outline. The synopsis should include actors names in brackets after each character. Choose actors that would be ideal for this role.
    ###
    outline: A big-headed daredevil fighter pilot goes back to school only to be sent on a deadly mission.
    synopsis: The Top Gun Naval Fighter Weapons School is where the best of the best train to refine their elite flying skills. When hotshot fighter pilot Maverick (Tom Cruise) is sent to the school, his reckless attitude and cocky demeanor put him at odds with the other pilots, especially the cool and collected Iceman (Val Kilmer). But Maverick isn't only competing to be the top fighter pilot, he's also fighting for the attention of his beautiful flight instructor, Charlotte Blackwood (Kelly McGillis). Maverick gradually earns the respect of his instructors and peers - and also the love of Charlotte, but struggles to balance his personal and professional life. As the pilots prepare for a mission against a foreign enemy, Maverick must confront his own demons and overcome the tragedies rooted deep in his past to become the best fighter pilot and return from the mission triumphant.
    ###
    outline: ${outline}
    synopsis:
    `,
    max_tokens: 700
  })
  const synopsis = response.data.choices[0].text.trim()
  document.getElementById('output-text').innerText = synopsis
  fetchTitle(synopsis)
  fetchStars(synopsis)
}

async function fetchTitle(synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Generate a short, catchy and original movie title based on the following synopsis: ${synopsis}`,
    max_tokens: 25,
    temperature: 0.7,
  })
  const title = response.data.choices[0].text.trim()
  document.getElementById('output-title').innerText = title
fetchImagePromtp(title, synopsis)
}

async function fetchStars(synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Extract the names of the actors from the following synopsis: ${synopsis}. The names are usually between parentheses after the name of the characters. Just give me the list of names, nothing else.`,
    max_tokens: 25,
  })
  document.getElementById('output-stars').innerText = response.data.choices[0].text.trim()
  console.log("Stars: ", response)
}

async function fetchImagePromtp(title, synopsis) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Based on the following title and synopsis: ${title} ${synopsis} create a prompt in order to generate an image (movie poster) using DALL-E. Don't mention character names, instead describe them. Don't describe the plot, instead describe the setting. Don't describe the story, instead describe the mood. Never include the words 'Image prompt:' in your prompt.`,
    max_tokens: 100,
  })
  const imagePrompt = response.data.choices[0].text.trim()
  fetchImage(imagePrompt)
}

async function fetchImage(imagePrompt) {
  const response = await openai.createImage({
    prompt: `${imagePrompt}. Don't add text to the image`,
    n: 1,
    size: '512x512',
    response_format: 'url'
  })
  document.getElementById('output-img-container').innerHTML = `<img src="${response.data.data[0].url}">`
  setupInputContainer.innerHTML = `<button id="view-pitch-btn" class="view-pitch-btn">View Pitch</button>`
  document.getElementById('view-pitch-btn').addEventListener("click", () => {
    document.getElementById('setup-container').style.display = "none"
    document.getElementById('output-container').style.display = "flex"
  })
}
