import { Exercise } from '../types/exercise';

export const MOCK_EXERCISES: Exercise[] = [
  {
    id: '1',
    title: 'C++ Hello World!',
    description: 'Ensimmäinen ohjelma: Tulostus näytölle.',
    language: 'C++',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: 'Millä komennolla tulostetaan tekstiä C++:ssa?',
    options: [
      'cout << "teksti";',
      'print("teksti");',
      'console.log("teksti");',
      'System.out.print("teksti");',
    ],
    correctAnswer: 'cout << "teksti";',
  },
  {
    id: '2',
    title: 'Kokonaisluvut',
    description: 'Muuttujat ja tyypit C++:ssa.',
    language: 'C++',
    difficulty: 'easy',
    type: 'multiple-choice',
    question: 'Miten määrittelet kokonaisluvun i ja annat sille arvon 10?',
    options: ['int i = 10;', 'Integer i = 10;', 'let i = 10;', 'var i = 10;'],
    correctAnswer: 'int i = 10;',
  },
];
