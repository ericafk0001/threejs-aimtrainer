# Three.js FPS Aim Trainer 🎯

## Overview

The FPS Aim Trainer is a 3D interactive project built using Three.js. It simulates a first-person shooting environment where players can practice their aim by shooting at dynamic targets. The game features adjustable difficulty levels, recoil mechanics, particle effects, and collision detection. Uses ray-casting.

---

## Features

- **Difficulty Levels**:
  - Easy: All targets visible, larger size.
  - Medium: Half the targets are visible, standard size.
  - Hard: Most targets are hidden, smaller size.
- **Recoil Mechanics**:
  - Dynamic recoil simulation for a more realistic shooting experience.
- **Interactive Targets**:
  - Targets respawn at random locations upon being hit.
- **Particle Effects**:
  - Shooting generates particles and collision explosions.
- **Score Tracking**:
  - Real-time score updates upon hitting targets.

---

## Installation

### Prerequisites

- A modern web browser with WebGL support.
- Local server to serve the project files (e.g., Python's HTTP server, VS Code Live Server).

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ericafk0001/threejs-aimtrainer.git
   ```
2. Navigate to the project folder:
   ```bash
   cd threejs-aimtrainer
   ```
3. Start the project:
   Start a Live Server (VS Code)

---

## Usage

1. Start the game by clicking the "Start" button.
2. Use your mouse to aim and left-click to shoot.
3. Press the "I" key to toggle between difficulty levels.
4. Aim at the targets to score points. Targets will respawn upon being hit.
5. Observe your score on the top-middle of the screen.

---

## Controls

- **Mouse Movement**: Rotate camera and aim.
- **Left Click**: Shoot.
- **"I" Key**: Cycle through difficulty levels.

---

## Future Improvements

- Add more dynamic targets with varied behaviors.
- Include a timer and leaderboard.
- Add more sound effects and background music.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Acknowledgments

- Inspired by Aimlabs Gridshot
- Built with [Three.js](https://threejs.org/).
