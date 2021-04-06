const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')

const languageRouter = express.Router()
const bodyParser = express.json()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    const knexInstance = req.app.get('db')
    const { head } = req.language
    try {
      const nextWord = await LanguageService.getNextWord(knexInstance, head)
        res.json({
          nextWord: nextWord.original,
          wordCorrectCount: nextWord.correct_count,
          wordIncorrectCount: nextWord.incorrect_count,
          totalScore: req.language.total_score,
        })
    } catch (error) {
        next(error)
    }
  })

languageRouter
  .post('/guess', bodyParser, async (req, res, next) => {
    const knexInstance = req.app.get('db')
    try {
      if (!Object.keys(req.body).includes('guess')) {
        return res.status(400).json({
          error: `Missing 'guess' in request body`,
        })
      }

      const words = await LanguageService.getLanguageWords(knexInstance , req.language.id)
      const wordsList = LanguageService.fillWordList(knexInstance , req.language, words)
      const userAnswer = req.body.guess;
      const correctAnswer = wordsList.head.value.translation;
      if (userAnswer.toLowerCase().split(' ').join('') === correctAnswer.toLowerCase().split(' ').join('')) {
        wordsList.head.value.correct_count++
        wordsList.head.value.memory_value =
          wordsList.head.value.memory_value * 2 >= wordsList.listNodes().length
            ? wordsList.listNodes().length - 1
            : wordsList.head.value.memory_value * 2;
        wordsList.total_score += 1
        wordsList.moveHeadBy(wordsList.head.value.memory_value);
        LanguageService.nextLinkedList(knexInstance, wordsList)
          .then(() => {
              res.json({
                nextWord: wordsList.head.value.original,
                wordCorrectCount: wordsList.head.value.correct_count,
                wordIncorrectCount: wordsList.head.value.incorrect_count,
                totalScore: wordsList.total_score,
                answer: req.body.guess,
                isCorrect: true,
              })
              next()
            })
      } else {
        wordsList.head.value.incorrect_count++;
        wordsList.head.value.memory_value = 1;
        const rightAnswer = wordsList.head.value.translation;
        wordsList.moveHeadBy(wordsList.head.value.memory_value);
        LanguageService.nextLinkedList(knexInstance, wordsList)
          .then(() => {
            res.json({
              nextWord: wordsList.head.value.original,
              wordCorrectCount: wordsList.head.value.correct_count,
              wordIncorrectCount: wordsList.head.value.incorrect_count,
              totalScore: wordsList.total_score,
              answer: rightAnswer,
              isCorrect: false,
            })
            next()
          })
      }
    } catch (error) {
      next(error)
    }  
  })

module.exports = languageRouter
