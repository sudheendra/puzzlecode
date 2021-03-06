/**
 * This is free and unencumbered software released into the public domain.
 * See UNLICENSE.
 */

function puzzle_welcome() {
  return {
    id: "intro_puzzle",
    name: "Welcome to Puzzle Code!",
    description: "Collect all the coins on the board.",

    // TODO: add read-only code mirror boxes to the hint
    hint: 
      "<p>"
      + "In Puzzle Code there are many <strong>instructions</strong> you "
      + "can use to <strong>program</strong> your robot."
      + "</p>"
      + "<p>"
      + "This level introduces you to <strong>two instructions</strong>: "
      + keyword("move") + " and " + keyword("turn") + "."
      + "</p>" 
      + "<h3>Move</h3>"
      + "<ul>"
      +   "<li>The " + keyword("move") + " instruction moves the "
      +       "robot forward one square.</li>"
      +   "<li>The robot can only move forward. It cannot move backwards or "
      +   "sideways.</li>"
      +     "<li>"
      +         "<a target='_blank' href='"
      +         WIKI_URL + "Move-instruction"
      +         "'>"
      +       "Learn more about the " + keyword_link("move") + " instruction."
      +     "</a></li>"
      + "</ul>"
      + "<h3>Turn</h3>"
      + "<ul>"
      +   "<li>" + keyword("turn left") + " will rotate the robot to the left." 
      +   "<li>" + keyword("turn right") + " will rotate the robot to the right."
      +     "<li>"
      +         "<a target='_blank' href='"
      +         WIKI_URL + "Turn-instruction"
      +         "'>"
      +       "Learn more about the " + keyword_link("turn") + " instruction."
      +     "</a></li>"
      + "</ul>"
      + "<h3>Example program</h3>"
      + "<pre>"
      + keyword("move") + "<br>"
      + keyword("move") + "<br>"
      + keyword("turn right") + "<br>"
      + keyword("move")
      + "</pre>"
      + "<p>This program tells the robot to:</p>"
      + "<ul>"
      +   "<li>move forward twice</li>"
      +   "<li>rotate to the right 90 degrees</li>"
      +   "<li>move forward once</li>"
      + "</ul>"

    ,
    win_conditions: [
      {type: WinCondition.COLLECT_COINS}
    ],

    constraints: [],

    solutions: [
      "move\nmove\nmove\nturn left\nmove\nmove\nmove\nmove\n",
    ],
    num_cols: 9,
    num_rows: 7,
    // BUG: this should be programming_bot_id, not index
    programming_bot_index: 0,
    bots : [
      {
        botColor: BotColor.BLUE,
        cellX: 4,
        cellY: 4,
        facing: Direction.UP,
        program: "move\nmove\nturn left\nmove\nmove\n",
      },
    ],
    coins: [
      {x:0, y:1},
      {x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
    ],
    // TODO: make it so that you can omit empty properties from a puzzle
    blocks: [],
    traps: [
      //{x:3, y:0}
    ]
  }
}