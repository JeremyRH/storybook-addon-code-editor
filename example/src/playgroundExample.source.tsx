import { useState } from 'react';
import { Button } from 'example-library';
import './playgroundExample.css';

const hands = [
  { title: 'rock', children: '✊' },
  { title: 'paper', children: '✋' },
  { title: 'scissors', children: '✌️' },
];

function getRandomChoice() {
  return Math.floor(Math.random() * 3);
}

export default () => {
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [ties, setTies] = useState(0);
  const [opponentChoice, setOpponentChoice] = useState(getRandomChoice);
  const [previousChoice, setPreviousChoice] = useState('');

  function onChoice(choice: number) {
    return () => {
      const result = (choice - opponentChoice + 2) % 3;
      [setWins, setLosses, setTies][result]((c) => c + 1);
      setPreviousChoice(hands[opponentChoice].children);
      setOpponentChoice(getRandomChoice);
    };
  }

  return (
    <>
      <h1>Complex example (rock, paper, scissors)</h1>

      <h2>
        <pre>
          Wins: {wins} | Losses: {losses} | Ties: {ties}
        </pre>
      </h2>

      {hands.map((hand, i) => (
        <Button
          onClick={onChoice(i)}
          backgroundColor="whitesmoke"
          className="button-nice"
          key={hand.title}
          {...hand}
        />
      ))}

      {previousChoice && (
        <h2>
          <pre>Opponent's previous choice: {previousChoice}</pre>
        </h2>
      )}
    </>
  );
};
