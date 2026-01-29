export function playCorrectSound() {
  const audio = new Audio("/sfx/right-answer.wav");
  audio.play();
}
export function playWrongSound() {
  const audio = new Audio("/sfx/wrong-answer.wav");
  audio.play();
}
