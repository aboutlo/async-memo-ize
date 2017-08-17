import memoize from 'async-memo-ize'
import axios from 'axios'

import './style.css'

const USERNAME = 'aboutlo'

const findStarsByUsername = async (username, date) => {
  const groupByLanguage = (memo, repo) => {
    if (!memo[repo.language]) {
      memo[repo.language] = []
    }
    memo[repo.language].push(repo)
    return memo
  }
  const sortByGroup = (a, b) => {
    if (a[1].length > b[1].length) return -1
    if (a[1].length < b[1].length) return 1
    return 0
  }

  try {
    const response = await axios.get(`https://api.github.com/users/${username}/starred`, {
      params: {
        per_page: 300,
        direction: 'desc',
        sort: 'stars',
      },
    })
    const groups = response.data
      .map(({ url, description, name, language, stargazers_count }) => ({
        name,
        description,
        url,
        language,
        counter: stargazers_count,
      }))
      .reduce(groupByLanguage, {})
    return Object.entries(groups).sort(sortByGroup)
  } catch (e) {
    throw e
  }
}
const findStarsByUsernameMemoized = memoize(findStarsByUsername)

function hero() {
  let element = document.createElement('h1')
  element.innerHTML = 'What does Lorenzo love on Github?'
  return element
}

function help() {
  let element = document.createElement('p')
  element.innerHTML =
    'Try to clear and reload again to see the difference between the first call (slow) and the following (instant). Have a look into your network panel ;)'
  return element
}

function display(groups) {
  let element = document.querySelector('#display') || document.createElement('div')
  element.id = 'display'
  console.log('groups', groups)
  if (groups) {
    element.innerHTML = `<ul>${groups
      .map(
        ([name, repos], index) => `
        <li>
          <input type="checkbox" id="list-item-${index}">
          <label for="list-item-${index}" class="first">${name}</label>
          <ul>${repos
            .map(({ name, counter }) => `<li><strong>${name}</strong> ⭐${counter}</li>`)
            .join('')}</ul>
        </li>`).join('')}
    </ul>`
  }
  return element
}

function button(label) {
  let button = document.createElement('button')
  button.innerHTML = label
  return button
}

const load = async () => {
  // the function is always called with the same args: username and the day date (without hours, minutes or ms)
  // first time it will take a few seconds to get the results from github and compute the value
  // Then the next calls will be instantly executed due to the memoization
  const stars = await findStarsByUsernameMemoized(USERNAME, new Date().toDateString())
  return display(stars)
}

async function bootstrap() {
  const btnLoad = button('I dunno!')
  const btnClear = button('Clear')
  const btnReLoad = button('Reload')
  btnClear.addEventListener('click', display.bind(undefined, []))
  btnLoad.addEventListener('click', load)
  btnReLoad.addEventListener('click', load)
  document.body.appendChild(hero())
  document.body.appendChild(btnLoad)
  document.body.appendChild(help())
  document.body.appendChild(btnClear)
  document.body.appendChild(btnReLoad)
  document.body.appendChild(display())
}

bootstrap().catch(e => console.log(e))
