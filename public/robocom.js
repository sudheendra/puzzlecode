/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * The simulator creates an Animation object for each animation that should be
 * carried out. It includes all the information needed for the visualization
 * engine to perform the animation.
 */

AnimationType = {
  NONE: 0,
  MOVE: 1,
  ROTATE: 2
}

/**
 * type: one of the values from AnimationType
 * data: data associated with the animation (e.g. an AnimationMove object)
 */
function Animation(type, data) {
  // value from the AnimationType enum
  this.type = type
  this.data = data
}

// move a bot (covers both torus and non-torus moves)
function AnimationMove(
    // boolean
    torus,
    // previous cell coordinates
    prevX, prevY,
    // out-of-bounds prev-X and prev-Y
    oobPrevX, oobPrevY,
    // out-of-bounds next-X and next-Y
    // i.e. what nextX and nextY would be if it weren't for the wrap around
    oobNextX, oobNextY,
    // either -1, 0, or 1
    dx, dy) {
  this.torus = torus
  this.prevX = prevX
  this.prevY = prevY
  this.oobPrevX = oobPrevX
  this.oobPrevY = oobPrevY
  this.oobNextX = oobNextX
  this.oobNextY = oobNextY
  this.dx = dx
  this.dy = dy
}

// rotate a bot
function AnimationTurn(oldFacing, newFacing) {
  this.oldFacing = oldFacing
  this.newFacing = newFacing
}



/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * IDEAS:
 *  - make the text box read-only while the simulation is playing
 *  - add break points
 *  - have the text box highlight the line that is currently being executed
 *
 * TODO: see if there is more sophisticated gutter mechanisms to
 * present comments and errors to the user
 * http://codemirror.net/doc/upgrade_v3.html#gutters
 *
 * TODO: listen for changes in the document and automatically update gutter
 * with comments and errors
 *
 * TODO: how to keep width of gutter constant?
 *
 * IDEA: breakpoints, see http://codemirror.net/demo/marker.html
 *
 * TODO: error text usually needs to be more verbose. Perhaps add a link to
 * a popup that explains the error and gives references.
 *
 * IDEA: put drop-down boxes in comment section so you can fit more text there
 *
 */

// lineComments is a map where line index points to comment for that line
function addLineComments(lineComments) {
  CODE_MIRROR_BOX.clearGutter("note-gutter")
  for (i in lineComments) {
      var comment = lineComments[i]
      CODE_MIRROR_BOX
        .setGutterMarker(
          parseInt(i),
          "note-gutter",
          comment)
  }
}/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO: careful unit testing

Opcode = {
  MOVE: 0,
  TURN: 1,
  GOTO: 2
}

function RobocomInstruction(
    // value must be in the Opcode enum
    opcode,
    // data object, whose type is determined by opcode
    data) {
  this.opcode = opcode
  this.data = data
}

function RobocomProgram(
    // string
    programText,
    // array of instruction objects (or null if there was an error)
    instructions,
    // maps lineNumber to comment for that line
    lineComments) {
  this.programText = programText
  this.instructions = instructions
  this.lineComments = lineComments
}

function newErrorComment(text, uri) {
  var newlink = document.createElement('a')
  newlink.setAttribute('href', uri)
  newlink.setAttribute('class', "errorLink")
  newlink.appendChild(newComment(text))
  return newlink
}

// TODO: make all comments hyperlinks, though the non-errors should be styled
// as if they're not hyperlinks (until you hover)
function newComment(text) {
  return document.createTextNode(text)
}

function removeComment(tokens) {
  var commentToken = -1
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]
    var commentCharIndex = token.indexOf("//")
    if (commentCharIndex == 0) {
      // completely exclude this token
      return tokens.slice(0, i)
    } else if (commentCharIndex > 0) {
      // trim this token and exclude the rest
      tokens[i] = token.substr(0, commentCharIndex)
      return tokens.slice(0, i + 1)
    }
  }
  return tokens
}

// returns [tokens, label]
// if a label is removed from tokens, then label is a string
// otherwise it is null
function removeLabel(tokens) {
  if (tokens.length == 0) {
    return [tokens, null]
  } else {
    var head = tokens[0]
    var colonIndex = head.indexOf(":")
    if (colonIndex <= 0) {
      return [tokens, null]
    } else if (colonIndex == head.length - 1) {
      var label = head.substr(0, head.length - 1)
      var newTokens = tokens.slice(1, tokens.length)
      return [newTokens, label]
    } else {
      var label = head.substr(0, colonIndex)
      var newHead = head.substr(colonIndex + 1, head.length)
      // asert newHead.length > 0
      tokens[0] = newHead
      return [tokens, label]
    }
  }
}

function compileMove(tokens) {
  var instruction = null
  var comment = null
  var error = false

  // assert tokens[0] == "move"
  if (tokens.length == 1) {
    instruction = new RobocomInstruction(Opcode.MOVE, null)
    comment = newComment("Move forward one square")
  } else {
    instruction = null
    comment = newErrorComment("Malformed 'move' instruction", "#")
    error = true
  }

  return [instruction, comment, error]
}

function compileTurn(tokens) {
  var instruction = null
  var comment = null
  var error = false

  // assert tokens[0] == "move"
  if (tokens.length != 2) {
    instruction = null
    comment = newErrorComment("The 'turn' instruction is missing a direction", "#")
    error = true
  } else {
    var direction = tokens[1]
    if (direction == "left") {
      instruction = new RobocomInstruction(Opcode.TURN, Direction.LEFT)
      comment = newComment("Rotate counter-clockwise 90 degrees")
    } else if (direction == "right") {
      instruction = new RobocomInstruction(Opcode.TURN, Direction.RIGHT)
      comment = newComment("Rotate clockwise 90 degrees")
    } else {
      instruction = null
      comment = newErrorComment("'" + direction + "' is not a valid direction", "#")
      error = true
    }
  }

  return [instruction, comment, error]
}



// TODO: make sure the label is sane: i.e. not a reserved word and conforms
// to identifier regex
function compileGoto(tokens) {
  var instruction = null
  var comment = null
  var error = false

  // TODO: this error message doesn't make sense if length > 2
  if (tokens.length != 2) {
    instruction = null
    comment = newErrorComment("The 'goto' instruction is missing a label", "#")
    error = true
  } else {
    var label = tokens[1]
    if (!isValidLabel(label)) {
      instruction = null
      comment = newErrorComment("'" + label + "' is not a valid label", "#")
      error = true
    } else {
      instruction = new RobocomInstruction(Opcode.GOTO, label)
      // this comment is filled in on the second pass
      comment = null
      error = false
    }
  }
  return [instruction, comment, error]
}

function tokenize(line) {
  return line
    .replace(/\s+/g, " ")
    .replace(/(^\s+)|(\s+$)/g, "")
    .split(" ")
}

function isValidLabel(label) {
  return label.length > 0 &&
    label.length < 20 &&
    !(label in RESERVED_WORDS) &&
    IDENT_REGEX.test(label)
}

/**
 * Returns [instruction, comment, error, label], where:
 *  instruction is a RobocomInstruction and comment is a string
 *    instruction is set to null if there was an error compiling the
 *    instruction, or if the line is a no-op
 *  label is a string or null
 *  comment is a DOM node, or null
 *  error is true iff there was an error compiling this line
 */
function compileLine(line, labels) {
  
  tokens = tokenize(line)
  tokens = removeComment(tokens)
  tokensLabel = removeLabel(tokens)
  tokens = tokensLabel[0]
  label = tokensLabel[1]

  if (label != null) {
    if (!isValidLabel(label)) {
      var abbrevLabel = label.substr(0, 20)
      comment = newErrorComment("'" + label + "' is not a valid label", "#")
      return [null, comment, true, null]
    } else if (label in labels) {
      // TODO: get labels
      comment = newErrorComment("label '" + label + "' is already defined", "#")
      return [null, comment, true, null]
    }
  }

  if (tokens.length == 0 ||
      (tokens.length == 1 && tokens[0] == "")) {
    return [null, null, false, label]
  }

  var opcode = tokens[0]
  if (opcode == "move") {
    return compileMove(tokens).concat([label])
  } else if (opcode == "turn") {
    return compileTurn(tokens).concat([label])
  } else if (opcode == "goto") {
    return compileGoto(tokens).concat([label])
  } else {
    comment = newErrorComment("'" + opcode + "' is not an instruction", "#")
    return [null, comment, true, null]
  }
}

// Compiles a programText into a RobocomProgram object
function compileRobocom(programText) {
  var lines = programText.split("\n")
  var instructions = []
  var lineComments = {}

  // map from label-string to instruction pointer for that label
  var labels = {}

  // map from label-string to line number for that label
  var labelLineNumbers = {}

  var error = false

  // first pass: do everything except finalize GOTO statements
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    var compiledLine = compileLine(line, labels)
    var instruction = compiledLine[0]
    var comment = compiledLine[1]
    var lineError = compiledLine[2]
    var label = compiledLine[3]

    if (label != null) {
      // TODO: make sure that GOTO pointing past last instruction works well
      labels[label] = instructions.length
      labelLineNumbers[label] = i + 1
    }

    if (instruction != null) {
      instruction.lineIndex = i
      instructions.push(instruction)
    }

    if (comment != null) {
      lineComments[i] = comment
    }

    error = error || lineError


  }

  // second pass: finalize GOTO statements
  for (var i = 0; i < instructions.length; i++) {
    var instruction = instructions[i]
    if (instruction.opcode == Opcode.GOTO) {
      var label = instruction.data
      if (label in labels) {
        // replace string label with numeric label
        instruction.data = labels[label]
        // TODO: better comment
        lineComments[instruction.lineIndex] =
          newComment("resume execution at line " + labelLineNumbers[label])
      } else {
        error = true
        lineComments[instruction.lineIndex] =
          newErrorComment("the label '" + label + "' does not exist", "#")
      }
    }
  }

  if (error) {
    return new RobocomProgram(programText, null, lineComments)
  } else {
    return new RobocomProgram(programText, instructions, lineComments)
  }
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// some functions useful for debugging

// add size functions to selections and transitions
d3.selection.prototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};

 d3.transition.prototype.size = function() {
  var n = 0;
  this.each(function() { ++n; });
  return n;
};

function assert(bool, message) {
  if (!bool) {
    alert(message)
  }
}


function assertLazy(func, message) {
  if (DEBUG) {
    assert(func(), message)
  }
}/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

Direction = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3
}

function rotateLeft(direction) {
  if (direction == Direction.LEFT) {
    return Direction.DOWN
  } else if (direction == Direction.DOWN) {
    return Direction.RIGHT
  } else if (direction == Direction.RIGHT) {
    return Direction.UP
  } else if (direction == Direction.UP) {
    return Direction.LEFT
  } else {
    // assert false
  }
}

function rotateRight(direction) {
  if (direction == Direction.LEFT) {
    return Direction.UP
  } else if (direction == Direction.UP) {
    return Direction.RIGHT
  } else if (direction == Direction.RIGHT) {
    return Direction.DOWN
  } else if (direction == Direction.DOWN) {
    return Direction.LEFT
  } else {
    // assert false
  }
}

function rotateDirection(oldFacing, rotateDirection) {
  if (rotateDirection == Direction.LEFT) {
    return rotateLeft(oldFacing)
  } else if (rotateDirection == Direction.RIGHT) {
    return rotateRight(oldFacing)
  } else {
    // assert false
  }
}/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// These event handlers are registered in main.js and in index.html

function windowOnLoad() {

  // Defines a syntax highlighter for the robocom language
  CodeMirror.defineMIME("text/x-robocom", {
    name: "clike",
    keywords: RESERVED_WORDS,
    blockKeywords: {},
    atoms: {},
    hooks: {
      "@": function(stream) {
        stream.eatWhile(/[\w\$_]/);
        return "meta";
      }
    }
  });

  pausePlay = document.getElementById("pauseplay")
  pausePlay.addEventListener("click", togglePausePlay);

  document
    .getElementById("restart")
    .addEventListener("click", restartSimulation);

  CODE_MIRROR_BOX = CodeMirror(document.getElementById("container"), {
    value: INITIAL_PROGRAM,
    gutters: ["note-gutter", "CodeMirror-linenumbers"],
    mode:  "text/x-robocom",
    theme: "solarized dark",
    smartIndent: false,
    lineNumbers: true,
  });

  restartSimulation()
  doPlay()

  // TODO: where should i put this?
  ANIMATE_INTERVAL = setInterval("animate()", CYCLE_DUR)
  nonBotAnimateInterval = setInterval("nonBotAnimate()", NON_BOT_CYCLE_DUR)
}

function setSpeed(speed) {
  var speedText = document.getElementById("speedText")

  ANIMATION_DUR = speed[0]
  CYCLE_DUR = speed[1]
  EASING = speed[3]
  speedText.innerHTML = speed[2]
  clearInterval(ANIMATE_INTERVAL)
  ANIMATE_INTERVAL = setInterval("animate()", CYCLE_DUR)
}

// TODO: consider graying out the play button when it's not possible to play it
function doPause() {
  PLAY_STATUS = PlayStatus.PAUSED
  pausePlay.innerHTML = 'Play!'
}

function doPlay() {
  if (BOARD.bots.length > 0) {
    PLAY_STATUS = PlayStatus.PLAYING
    pausePlay.innerHTML = 'Pause'
  }
}

function togglePausePlay() {
  // TODO: determine is this is threadsafe in JS
  if (PLAY_STATUS == PlayStatus.PAUSED) {
    doPlay()
  } else {
    doPause()
  }
}

/**
 * - Pauses the simulation
 * - resets the board state
 * - compiles the program
 */
function restartSimulation() {
  doPause()
  cleanUpSimulation()
  cleanUpVisualization()
  var programText = CODE_MIRROR_BOX.getValue()
  var program = compileRobocom(programText)
  addLineComments(program.lineComments)

  BOARD.initCoins = [
      {x:1, y:1},
      {x:2, y:1},
      {x:3, y:1},
      {x:4, y:1}
    ]

  BOARD.coins = _.clone(BOARD.initCoins)

  BOARD.coinsCollected = 0
  drawCoins()

  if (program.instructions != null) {
    BOARD.bots = initBots(program)
    drawBots()
  }

  BOARD.blocks = [
      {x:1, y:2},
      {x:2, y:2},
      {x:3, y:2},
    ]
  drawBlocks()

}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function Bot(x, y, facing, program) {

    this.cellX = x;
    this.cellY = y
    this.facing = facing;
    // an array of strings, each string is an "instruction"
    this.program = program;
    // instruction pointer points to the next instruction to be executed
    this.ip = 0;

    // the next animation to perform for this bot
    this.animations = {};
}

function turnBot(bot, direction) {
  var oldFacing = bot.facing
  bot.facing = rotateDirection(bot.facing, direction)
  bot.animations = { rotate : new AnimationTurn(oldFacing, bot.facing) }
}

// TODO: handle case where goto goes past end of program
function executeGoto(bot, nextIp) {
  bot.ip = nextIp
  // animation?
}

// a bot tries to move into cell x,y.
// returns true if the bot is allowed to move in, false otherwise
function tryMove(board, bot, x, y) {
  var matchingBlocks = _(board.blocks)
    .filter( function(block) {
      return block.x == x && block.y == y
    })
    .value()

  return matchingBlocks.length == 0
}

// executes the 'move' instruciton on the bot
// updates the bot state
function moveBot(board, bot) {

  bot.animations = {}

  var prevX = bot.cellX
  var prevY = bot.cellY

  var dx = 0
  var dy = 0
  if (bot.facing == Direction.UP) {
    dy = -1
  } else if (bot.facing == Direction.DOWN) {
    dy = 1
  } else if (bot.facing == Direction.LEFT) {
    dx = -1
  } else if (bot.facing == Direction.RIGHT) {
    dx = 1
  } else {
    // assert(false)
  }

  xResult = wrapAdd(bot.cellX, dx, NUM_COLS)
  yResult = wrapAdd(bot.cellY, dy, NUM_ROWS)
  destX = xResult[0]
  destY = yResult[0]
  xTorus = xResult[1]
  yTorus = yResult[1]

  if (!tryMove(board, bot, destX, destY)) {
    bot.animations.failMove = {
      destX: bot.cellX + dx,
      destY: bot.cellY + dy
    }
  } else {
    // TOOD: break this function up into smaller functions

    bot.cellX = destX
    bot.cellY = destY

    // did the bot pickup a coin?
    var matchingCoins = _(BOARD.coins)
      .filter( function(coin) {
        return coin.x == bot.cellX && coin.y == bot.cellY
      })
      .value()

    assert(matchingCoins.length == 0 || matchingCoins.length == 1,
      "matchingCoins.length == 0 || matchingCoins.length == 1")

    if (matchingCoins.length == 1) {
      var matchingCoin = matchingCoins[0]

      // remove the coin from the board
      BOARD.coins = _(BOARD.coins)
        .filter( function(coin) {
          return !(coin.x == bot.cellX && coin.y == bot.cellY)
        })
        .value()

      BOARD.coinsCollected += 1

      bot.animations.coin_collect = matchingCoin
    }

    // define the animation for the move
    var animationData = new AnimationMove(
      xTorus == "torus" || yTorus == "torus",
      prevX, prevY,
      bot.cellX - dx, bot.cellY - dy,
      prevX + dx, prevY + dy,
      dx, dy)

    bot.animations.move = animationData
  }
}

// assumes relatively sane values for increment
// returns [value, moveType]
// where moveType == "moveTorus" or "moveNonTorus"
function wrapAdd(value, increment, outOfBounds) {
  value += increment
  if (value >= outOfBounds) {
    return [value % outOfBounds, "torus"]
  } else if (value < 0) {
    return [outOfBounds + value, "torus"]
  } else {
    return [value, "nonTorus"]
  }
}

// TODO: do a better job separating model from view.
function step(bots) {
  // TODO: determine for each for javascript
  var numBots = bots.length
  for (var i = 0; i < numBots; i++) {
    var bot = bots[i]

    var instruction = bot.program.instructions[bot.ip]
    bot.ip = (bot.ip + 1) % bot.program.instructions.length
    bot.animations = {}
    if (instruction.opcode == Opcode.MOVE) {
      moveBot(BOARD, bot)
    } else if (instruction.opcode == Opcode.TURN) {
      turnBot(bot, instruction.data)
    } else if (instruction.opcode == Opcode.GOTO) {
      executeGoto(bot, instruction.data)
    }
  }
}

function cleanUpSimulation() {
  BOARD.bots = []
}

function initBots(prog) {
  var initBot = new Bot(
    Math.floor((NUM_COLS - 1) / 2),
    Math.floor((NUM_ROWS - 1)/ 2),
    Direction.UP,
    prog)

  return [initBot]  
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Instead of using D3 selectAll, just do D3 select(node) for a given node
 * reference.
 */

function directionToAngle(direction) {
  if (direction == Direction.UP) {
    return 0
  } else if (direction == Direction.DOWN) {
    return 180
  } else if (direction == Direction.LEFT) {
    return -90
  } else if (direction == Direction.RIGHT) {
    return 90
  } else {
    // assert false
  }
}

function botTransform(x, y, facing) {
  return "translate(" + x + ", " + y + ") " +
    "rotate(" + directionToAngle(facing) + " 16 16)"
}

function nonBotAnimate() {
  // TODO: animate coins rotating or something
  // IDEA: perhaps the reason nonBotAnimate and animateCoinCollection were
  // interferring is because they were both operating on the same svg elements
  // but they were using different transition objects.
}

function animateCoinCollection(coins, bots) {

  _(bots)
    .map( function(b) {
      if ("coin_collect" in b.animations) {
        // need to serialize coin objects as strings so they can be used as keys
        // in the collectedCoins object
        return b.animations.coin_collect
      } else {
        return null
      }
    })
    .compact()
    .forEach( function(coin) {
      d3.select("#" + coinId(coin)).transition()
        .attr("r", COIN_EXPLODE_RADIUS)
        .attr("opacity", "0.0")
        .delay(ANIMATION_DUR / 4)
        .ease("cubic")
        .duration(ANIMATION_DUR)
    })
}

function animateFailMove(transition) {
  var MOVE_DEPTH = 6
  transition
  .filter( function(bot) {
    return "failMove" in bot.animations
  })
  .attr("transform", function(bot) {
    var animation = bot.animations.failMove
    var dx = 0
    var dy = 0
    if (bot.cellX != animation.destX) {
      dx = (animation.destX - bot.cellX) * MOVE_DEPTH
    }
    if (bot.cellY != animation.destY) {
      dy = (animation.destY - bot.cellY) * MOVE_DEPTH
    }
    var x = bot.cellX * CELL_SIZE + dx
    var y = bot.cellY * CELL_SIZE + dy
    return botTransform(x, y, bot.facing)
  })
  .ease("cubic")
  .duration(ANIMATION_DUR / 2)
  .each("end", function() {
    d3.select(this).transition() 
      .attr("transform", function(bot) {
        var x = bot.cellX * CELL_SIZE
        var y = bot.cellY * CELL_SIZE 
        return botTransform(x, y, bot.facing)
      })
  })
  .ease(EASING)
  .duration(ANIMATION_DUR / 2)
}

function animateRotate(transition) {
  transition.filter( function(bot) {
    return "rotate" in bot.animations
  })
  .attr("transform", function(bot) {
    var x = bot.cellX * CELL_SIZE
    var y = bot.cellY * CELL_SIZE
    return botTransform(x, y, bot.facing)
  })
  .ease(EASING)
  .duration(ANIMATION_DUR)
}

function animateMoveNonTorus(transition) {
  transition.filter( function(bot) {
    return "move" in bot.animations && !bot.animations.move.torus
  })
  .attr("transform", function(bot) {
    var x = bot.cellX * CELL_SIZE
    var y = bot.cellY * CELL_SIZE
    return botTransform(x, y, bot.facing)
  })
  .ease(EASING)
  .duration(ANIMATION_DUR)
}

function isTorusBot(bot) {
  return "move" in bot.animations && bot.animations.move.torus
}

function animateMoveTorus(transition, bots) {

  /**
   * Replace the svg-bot element with a clone, and move the original bot
   * across the screen (out of bounds). Then move both svg elements at the
   * same time.
   */

  torusBots = bots.filter( function(bot) {
    return isTorusBot(bot)
  })

  // create the clone of the bot
  VIS.selectAll(".botClone")
    .data(torusBots)
    .enter().append("svg:use")
    .attr("class", "bot")
    .attr("xlink:href", "#botTemplate")
    .attr("transform", function(bot) {
      var x = bot.animations.move.prevX * CELL_SIZE
      var y = bot.animations.move.prevY * CELL_SIZE
      return botTransform(x, y, bot.facing)
    })
    .transition()
    .attr("transform", function(bot) {
      var x = bot.animations.move.oobNextX * CELL_SIZE
      var y = bot.animations.move.oobNextY * CELL_SIZE
      return botTransform(x, y, bot.facing)
    })
    .ease(EASING)
    .duration(ANIMATION_DUR)
    .each("end", function() {
      // garbage collect the bot clones
      d3.select(this).remove()
    })

  // instantly move the bot across to the other side of the screen
  transition.filter( function(bot) {
      return isTorusBot(bot)
    })
    .attr("transform", function(bot) {
      var x = bot.animations.move.oobPrevX * CELL_SIZE
      var y = bot.animations.move.oobPrevY * CELL_SIZE
      return botTransform(x, y, bot.facing)
    })
    .ease(EASING)
    .duration(0)
    .each("end", function() {
      // once the bot is on the other side of the screen, move it like normal
      d3.select(this).transition() 
        .attr("transform", function(bot) {
          var x = bot.cellX * CELL_SIZE
          var y = bot.cellY * CELL_SIZE
          return botTransform(x, y, bot.facing)
        })
        .ease(EASING)
        .duration(ANIMATION_DUR)
    })

}

// TODO: breakup into smaller functions
function animate() {
  if (PLAY_STATUS == PlayStatus.PAUSED) {
    return;
  }

  // advance the simulation by one "step"
  step(BOARD.bots)

  // must pass initCoins for d3 transitions to work. Since the svg-coin
  // elements are never removed from the board (until the simulation ends)
  // the d3 transition must operate on BOARD.initCoins, not BOARD.coins
  animateCoinCollection(BOARD.initCoins, BOARD.bots)

  var transition = d3.selectAll(".bot").data(BOARD.bots).transition()

  animateFailMove(transition)
  animateRotate(transition)
  animateMoveNonTorus(transition)
  animateMoveTorus(transition, BOARD.bots)
}

function cleanUpVisualization() {
  d3.selectAll(".bot").remove()
  d3.selectAll(".coin").remove()
  d3.selectAll(".botClone").remove()
  d3.selectAll(".block").remove()
}
 
function createBoard() {
  VIS = d3.select("#board")
    .attr("class", "vis")
    .attr("width", NUM_COLS * CELL_SIZE)
    .attr("height", NUM_ROWS * CELL_SIZE)
}

function drawCells() {

  var cells = new Array()
  for (var x = 0; x < NUM_COLS; x++) {
    for (var y = 0 ; y < NUM_ROWS; y++) {
      cells.push({'x': x, 'y': y })
    }
  }

  VIS.selectAll(".cell")
    .data(cells)
    .enter().append("svg:rect")
    .attr("class", "cell")
    .attr("stroke", "lightgray")
    .attr("fill", "white")
    .attr("x", function(d) { return d.x * CELL_SIZE })
    .attr("y", function(d) { return d.y * CELL_SIZE })
    .attr("width", CELL_SIZE)
    .attr("height", CELL_SIZE)

 }

function coinId(coin) {
  return "coin_" + coin.x + "_" + coin.y
}

function drawCoins() {
  VIS.selectAll(".coin")
    .data(BOARD.coins)
    .enter().append("svg:circle")
    .attr("class", "coin")
    .attr("id", function(coin){ return coinId(coin)} )
    .attr("stroke", "goldenrod")
    .attr("fill", "gold")
    .attr("opacity", "1.0")
    .attr("r", COIN_RADIUS)
    .attr("cx", function(d){ return d.x * CELL_SIZE + CELL_SIZE/2 } )
    .attr("cy", function(d){ return d.y * CELL_SIZE + CELL_SIZE/2} )
}

function drawBlocks() {
  VIS.selectAll(".block")
    .data(BOARD.blocks)
    .enter().append("svg:rect")
    .attr("class", "block")
    .attr("stroke", "darkgray")
    .attr("fill", "darkgray")
    .attr("width", CELL_SIZE)
    .attr("height", CELL_SIZE)
    .attr("x", function(d){ return d.x * CELL_SIZE } )
    .attr("y", function(d){ return d.y * CELL_SIZE } )
}

function drawBots() {
  VIS.selectAll(".bot")
    .data(BOARD.bots)
    .enter().append("svg:use")
    .attr("class", "bot")
    .attr("xlink:href", "#botTemplate")
    .attr("transform", function(bot) {
      var x = bot.cellX * CELL_SIZE
      var y = bot.cellY * CELL_SIZE
      return botTransform(x, y, bot.facing)
    })
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Holds all top-level variables, function invocations etc.
 */

// [animationDuration, delayDuration, description, easing]
PlaySpeed = {
  SUPER_SLOW: [2000, 4000, "Super slow", "cubic-in-out"],
  SLOW: [750, 1500, "Slow", "cubic-in-out"],
  NORMAL: [400, 600, "Normal", "cubic-in-out"],
  FAST: [150, 150, "Fast", "linear"],
  SUPER_FAST: [0, 0, "Super fast", "linear"]
}

PlayStatus = {
  PAUSED: 0,
  PLAYING: 1
}

// TODO: better var names and all caps
var NUM_COLS = 9,
    NUM_ROWS = 7,
    CELL_SIZE = 32,
    VIS = null,
    ANIMATE_INTERVAL = null,
    PLAY_STATUS = PlayStatus.PLAYING,
    INIT_PLAY_SPEED = PlaySpeed.FAST,
    ANIMATION_DUR = INIT_PLAY_SPEED[0]
    CYCLE_DUR = INIT_PLAY_SPEED[1],
    EASING = INIT_PLAY_SPEED[3],
    NON_BOT_ANIMATION_DUR = PlaySpeed.SLOW[0],
    NON_BOT_CYCLE_DUR = NON_BOT_ANIMATION_DUR,
    INITIAL_PROGRAM = "\nstart:move\nmove\nmove\nturn left\ngoto start\n",
    CODE_MIRROR_BOX = null,
    pausePlay = null,
    DEBUG = true,
    IDENT_REGEX = /^[A-Za-z][A-Za-z0-9_]*$/,

    /**
     * TODO: create a cell property, where cell[x][y] yields
     * a list of objects in that cell. In the mean time, I'll just search
     * through the bots and coins objects when needed.
     */
    BOARD = {
      bots : [],
      // the coins currently on the board (changes throughout a simulation)
      coins : [],
      // the coins originally placed on the board (immutable throughout a
      // simulation)
      initCoins: [],
      coinsCollected : 0,
      blocks : []
    }

// map of reserved words (built using fancy lodash style)
var reservedWords = "move turn left right goto"
var RESERVED_WORDS = _(reservedWords.split(" "))
  .map(function(word) { return [word, true] })
  .object()
  .value()

var COIN_RADIUS = 6
var COIN_EXPLODE_RADIUS = 100

window.onload = windowOnLoad
createBoard()
drawCells()
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * array of [programLine, instructionObject] pairs
 * tests ability to correctly compile instructions and detect errors
 * specific to instructions.
 * 
 * Things that are __not__ tested here:
 *    - tokenization
 *    - comments
 *    - labels
 *    - second phase of goto parsing
 */
var testInstructions = [

    ["move", new RobocomInstruction(Opcode.MOVE, null)],
    ["move foo", null],
    ["move foo bar", null],

    ["turn left", new RobocomInstruction(Opcode.TURN, Direction.LEFT)],
    ["turn right", new RobocomInstruction(Opcode.TURN, Direction.RIGHT)],
    ["turn up", null],
    ["turn down", null],
    ["turn", null],
    ["turn 0", null],
    ["turn 1", null],
    ["turn left right", null],
    ["turn left foo", null],

    ["goto foo_1", new RobocomInstruction(Opcode.GOTO, "foo_1")],
    ["goto foo bar", null],
    ["goto 1foo", null],
    ["goto _foo", null],
    ["goto move", null],
    ["goto goto", null]

  ]

for (var i = 0; i < testInstructions.length; i++) {
  var line     = testInstructions[i][0]
  var expected = testInstructions[i][1]
  var result = compileLine(line)[0]
  assert(_.isEqual(result, expected),
    "compile('" + line + "') != expected")
}
/**
 * Copyright 2013 Michael N. Gagnon
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// list of [board, bot, x, y, expectedResult] test cases
var testTryMove = [
    [{blocks : [{x:5,y:5}]}, {facing: "any"}, 5, 5, false],
    [{blocks : [{x:5,y:5}]}, {facing: "any"}, 5, 6, true],
    [{blocks : [{x:5,y:5}]}, {facing: "any"}, 6, 5, true],
    [{blocks : [{x:5,y:5}]}, {facing: "any"}, 6, 6, true]
  ]

for (var i = 0; i < testTryMove.length; i++) {
  var board    = testTryMove[i][0]
  var bot      = testTryMove[i][1]
  var x        = testTryMove[i][2]
  var y        = testTryMove[i][3]
  var expected = testTryMove[i][4]
  var result = tryMove(board, bot, x, y)
  assert(_.isEqual(result, expected),
    "tryMove '" + testTryMove[i] + "' failed")
}
