const LinkedList = require('../linked-list/LinkedList')

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getNextWord(db, id) {
    return db('word')
      .select('id', 'next', 'original', 'correct_count', 'incorrect_count')
      .where({id})
      .first()
  },

  fillWordList(db, language, words) {
    const wordList = new LinkedList()
    wordList.id = language.id
    wordList.name = language.name
    wordList.total_score = language.total_score
    let word = words.find(wd => wd.id === language.head)

    wordList.insertFirst({
      id: word.id,
      original: word.original,
      translation: word.translation,
      memory_value: word.memory_value,
      correct_count: word.correct_count,
      incorrect_count: word.incorrect_count,
    })

    while (word.next) {
      word = words.find( wd => wd.id === word.next)
      wordList.insertLast({
        id: word.id,
        original: word.original,
        translation: word.translation,
        memory_value: word.memory_value,
        correct_count: word.correct_count,
        incorrect_count: word.incorrect_count,
      })
    }

    return wordList
  },

  nextLinkedList(db, linkedLanguage) {
    return db.transaction(trans =>
      Promise.all([
        db('language')
          .transacting(trans)
          .where('id', linkedLanguage.id)
          .update({
            total_score: linkedLanguage.total_score,
            head: linkedLanguage.head.value.id,
        }),

        ...linkedLanguage.forEach(node =>
          db('word')
            .transacting(trans)
            .where('id', node.value.id)
            .update({
              memory_value: node.value.memory_value,
              correct_count: node.value.correct_count,
              incorrect_count: node.value.incorrect_count,
              next: node.next ? node.next.value.id : null,
            })
        )
      ])
    )
  }
}

module.exports = LanguageService
