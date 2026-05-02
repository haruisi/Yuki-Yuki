const compounds = window.compounds || [];  
const reactions = window.reactions || [];  
  
const compoundMap = new Map(compounds.map(compound => [compound.id, compound]));  
  
const routeModeBtn = document.getElementById("routeModeBtn");  
const quizModeBtn = document.getElementById("quizModeBtn");  
const routeControls = document.getElementById("routeControls");  
const quizControls = document.getElementById("quizControls");  
const routeModeArea = document.getElementById("routeModeArea");  
const quizModeArea = document.getElementById("quizModeArea");  
  
const compoundSelect = document.getElementById("compoundSelect");  
const typeFilter = document.getElementById("typeFilter");  
const compoundName = document.getElementById("compoundName");  
const compoundFormula = document.getElementById("compoundFormula");  
const compoundGroup = document.getElementById("compoundGroup");  
const compoundSummary = document.getElementById("compoundSummary");  
const structureBox = document.getElementById("structureBox");  
const reactionBox = document.getElementById("reactionBox");  
const reactionCount = document.getElementById("reactionCount");  
const lastReactionBox = document.getElementById("lastReactionBox");  
const historyBox = document.getElementById("historyBox");  
const incomingBox = document.getElementById("incomingBox");  
const compoundChips = document.getElementById("compoundChips");  
const searchInput = document.getElementById("searchInput");  
const searchResults = document.getElementById("searchResults");  
const backBtn = document.getElementById("backBtn");  
const resetBtn = document.getElementById("resetBtn");  
  
const quizNumber = document.getElementById("quizNumber");  
const quizProblem = document.getElementById("quizProblem");  
const answerGrid = document.getElementById("answerGrid");  
const checkAnswerBtn = document.getElementById("checkAnswerBtn");  
const showExplanationBtn = document.getElementById("showExplanationBtn");  
const nextProblemBtn = document.getElementById("nextProblemBtn");  
const judgeBox = document.getElementById("judgeBox");  
const explanationBox = document.getElementById("explanationBox");
const difficultySelect = document.getElementById("difficultySelect");
const quizTypeSelect = document.getElementById("quizTypeSelect");  
  
let currentId = "benzene";  
let history = [];  
let lastReaction = null;  
let currentQuizProblem = null;  
let generatedProblemCount = 0;
let quizDifficulty = "standard";
let quizTypeFilter = "all";
let currentReactionGroups = [];  
  
const quizSymbols = ["A", "B", "C", "D"];  
  
function escapeHTML(text) {  
  return String(text)  
    .replaceAll("&", "&amp;")  
    .replaceAll("<", "&lt;")  
    .replaceAll(">", "&gt;")  
    .replaceAll('"', "&quot;")  
    .replaceAll("'", "&#039;");  
}  
  
function getCompound(id) {  
  return compoundMap.get(id) || {  
    id: "unknown",  
    name: "未登録",  
    formula: "-",  
    group: "未登録",  
    summary: "この物質はデータに登録されていません。"  
  };  
}  
  
function typeClass(type) {  
  const map = {  
    "酸化": "type-oxidation",  
    "還元": "type-reduction",  
    "置換": "type-substitution",  
    "酸塩基": "type-acidbase",  
    "エステル化": "type-esterification",  
    "アセチル化": "type-acetylation",
    "アシル化": "type-acetylation",  
    "加水分解": "type-hydrolysis",  
    "確認反応": "type-confirmation",  
    "ジアゾカップリング": "type-coupling",
    "脱炭酸": "type-decarboxylation",
    "酸分解": "type-acidcleavage",
    "付加": "type-addition"  
  };  
  
  return map[type] || "type-substitution";  
}  
  
function shuffleArray(array) {  
  const copied = [...array];  
  
  for (let i = copied.length - 1; i > 0; i--) {  
    const j = Math.floor(Math.random() * (i + 1));  
    [copied[i], copied[j]] = [copied[j], copied[i]];  
  }  
  
  return copied;  
}  
  
function pickOne(array) {  
  return array[Math.floor(Math.random() * array.length)];  
}  
  
function initQuizTypeSelect() {
  if (!quizTypeSelect) return;

  const productTypes = [
    ...new Set(
      reactions
        .filter(reaction => reaction.to)
        .map(reaction => reaction.type)
    )
  ];

  quizTypeSelect.innerHTML = "";

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "すべて";
  quizTypeSelect.appendChild(allOption);

  productTypes.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = `${type}だけ`;
    quizTypeSelect.appendChild(option);
  });

  quizTypeSelect.value = quizTypeFilter;
}

function initSelects() {  
  compoundSelect.innerHTML = "";  
  
  compounds.forEach(compound => {  
    const option = document.createElement("option");  
    option.value = compound.id;  
    option.textContent = compound.name;  
    compoundSelect.appendChild(option);  
  });  
  
  const types = ["すべて", ...new Set(reactions.map(reaction => reaction.type))];  
  
  typeFilter.innerHTML = "";  
  
  types.forEach(type => {  
    const option = document.createElement("option");  
    option.value = type === "すべて" ? "all" : type;  
    option.textContent = type;  
    typeFilter.appendChild(option);  
  });  
  
  compoundSelect.value = currentId;  
  typeFilter.value = "all";  
}  
  
function getOutgoingReactions() {  
  const selectedType = typeFilter.value;  
  const outgoing = reactions.filter(reaction => reaction.from === currentId);  
  
  if (selectedType === "all") {  
    return outgoing;  
  }  
  
  return outgoing.filter(reaction => reaction.type === selectedType);  
}  
  
function moveToCompound(id, reaction = null) {  
  if (!compoundMap.has(id)) return;  
  
  if (reaction && reaction.to) {  
    history.push(reaction);  
    lastReaction = reaction;  
  }  
  
  currentId = id;  
  compoundSelect.value = currentId;  
  renderRouteMode();  
  window.scrollTo({ top: 0, behavior: "smooth" });  
}  
  
function renderStructure() {  
  if (typeof window.getStructureSVG === "function") {  
    structureBox.innerHTML = window.getStructureSVG(currentId);  
  } else {  
    structureBox.innerHTML = `  
      <div class="structure-empty">  
        構造式表示用の structures.js が読み込まれていません。  
      </div>  
    `;  
  }  
}  
  
function renderCurrentCompound() {  
  const compound = getCompound(currentId);  
  
  compoundName.textContent = compound.name;  
  compoundFormula.textContent = compound.formula;  
  compoundGroup.textContent = compound.group;  
  compoundSummary.textContent = compound.summary;  
  
  renderStructure();  
}  
  
function renderLastReaction() {  
  if (!lastReaction) {  
    lastReactionBox.innerHTML = `<p class="route-empty">まだ生成物へ進んでいません。</p>`;  
    return;  
  }  
  
  const from = getCompound(lastReaction.from);  
  const to = getCompound(lastReaction.to);  
  
  lastReactionBox.innerHTML = `  
    <div class="mini-card">  
      <b>${escapeHTML(from.name)} → ${escapeHTML(to.name)}</b><br>  
      ${escapeHTML(lastReaction.name)}｜${escapeHTML(lastReaction.reagent)}<br>  
      <span class="summary">${escapeHTML(lastReaction.point)}</span>  
    </div>  
  `;  
}  
  
function getReactionGroupKey(reaction) {
  return [
    reaction.from,
    reaction.type,
    reaction.name,
    reaction.reagent
  ].join("||");
}

function getVisibleReactionGroups() {
  const visibleReactions = getOutgoingReactions();
  const groups = [];

  visibleReactions.forEach(reaction => {
    const key = getReactionGroupKey(reaction);
    let group = groups.find(item => item.key === key);

    if (!group) {
      group = {
        key,
        type: reaction.type,
        name: reaction.name,
        reagent: reaction.reagent,
        reactions: []
      };
      groups.push(group);
    }

    group.reactions.push(reaction);
  });

  return groups;
}

function renderReactions() {
  const visibleReactions = getOutgoingReactions();
  const allOutgoing = reactions.filter(reaction => reaction.from === currentId);
  currentReactionGroups = getVisibleReactionGroups();

  reactionCount.textContent = `登録済み反応：${allOutgoing.length}件 / 表示中：${currentReactionGroups.length}件`;

  if (currentReactionGroups.length === 0) {
    reactionBox.innerHTML = `
      <p class="route-empty">
        この条件で表示できる反応はありません。
      </p>
    `;
    return;
  }

  reactionBox.innerHTML = currentReactionGroups.map((group, groupIndex) => {
    const actionButtons = group.reactions.map((reaction, reactionIndex) => {
      if (!reaction.to) {
        return `<button class="secondary" disabled>観察結果</button>`;
      }

      const to = getCompound(reaction.to);
      const label = group.reactions.length >= 2
        ? `${escapeHTML(to.name)}へ`
        : "進む";

      return `<button onclick="goVisibleReactionGroup(${groupIndex}, ${reactionIndex})">${label}</button>`;
    }).join("");

    return `
      <article class="reaction-card ${typeClass(group.type)}">
        <div class="reaction-head">
          <span class="reaction-type">${escapeHTML(group.type)}</span>
          <span class="reaction-title">${escapeHTML(group.name)}</span>
        </div>

        <div class="reaction-info">
          <div><b>試薬・条件：</b>${escapeHTML(group.reagent)}</div>
        </div>

        <div class="reaction-actions">
          ${actionButtons}
        </div>
      </article>
    `;
  }).join("");
}  
  
function renderHistory() {  
  if (history.length === 0) {  
    historyBox.innerHTML = `<p class="route-empty">まだ反応をたどっていません。</p>`;  
    return;  
  }  
  
  historyBox.innerHTML = history.map((reaction, index) => {  
    const from = getCompound(reaction.from);  
    const to = getCompound(reaction.to);  
  
    return `  
      <div class="history-step">  
        <b>${index + 1}.</b>  
        ${escapeHTML(from.name)} → ${escapeHTML(to.name)}<br>  
        ${escapeHTML(reaction.name)}｜${escapeHTML(reaction.reagent)}  
      </div>  
    `;  
  }).join("");  
}  
  
function renderIncoming() {  
  const incoming = reactions.filter(reaction => reaction.to === currentId);  
  
  if (incoming.length === 0) {  
    incomingBox.innerHTML = `<p class="route-empty">この物質への作り方は、まだ登録されていません。</p>`;  
    return;  
  }  
  
  incomingBox.innerHTML = incoming.map(reaction => {  
    const from = getCompound(reaction.from);  
  
    return `  
      <div class="incoming-card">  
        <b>${escapeHTML(from.name)}</b> から<br>  
        ${escapeHTML(reaction.name)}｜${escapeHTML(reaction.reagent)}  
      </div>  
    `;  
  }).join("");  
}  
  
function renderCompoundChips() {  
  compoundChips.innerHTML = compounds.map(compound => {  
    const activeClass = compound.id === currentId ? "active" : "";  
  
    return `  
      <button class="chip ${activeClass}" onclick="selectOnly('${compound.id}')">  
        ${escapeHTML(compound.name)}  
      </button>  
    `;  
  }).join("");  
}  
  
function renderSearchResults() {  
  const keyword = searchInput.value.trim();  
  
  if (keyword === "") {  
    searchResults.innerHTML = "";  
    return;  
  }  
  
  const hits = compounds.filter(compound => {  
    const text = `${compound.name} ${compound.formula} ${compound.group} ${compound.summary}`;  
    return text.includes(keyword);  
  });  
  
  if (hits.length === 0) {  
    searchResults.innerHTML = `<span class="route-empty">該当する物質はありません。</span>`;  
    return;  
  }  
  
  searchResults.innerHTML = hits.map(compound => {  
    return `  
      <button class="chip" onclick="selectOnly('${compound.id}')">  
        ${escapeHTML(compound.name)}  
      </button>  
    `;  
  }).join("");  
}  
  
function renderRouteMode() {  
  renderCurrentCompound();  
  renderLastReaction();  
  renderReactions();  
  renderHistory();  
  renderIncoming();  
  renderCompoundChips();  
  renderSearchResults();  
}  
  
function goVisibleReactionGroup(groupIndex, reactionIndex) {
  const group = currentReactionGroups[groupIndex];
  if (!group) return;

  const reaction = group.reactions[reactionIndex];
  if (!reaction || !reaction.to) return;

  moveToCompound(reaction.to, reaction);
}

function goVisibleReaction(index) {  
  const visibleReactions = getOutgoingReactions();  
  const reaction = visibleReactions[index];  
  
  if (!reaction || !reaction.to) return;  
  
  moveToCompound(reaction.to, reaction);  
}  
  
function selectOnly(id) {  
  if (!compoundMap.has(id)) return;  
  
  currentId = id;  
  compoundSelect.value = currentId;  
  renderRouteMode();  
  window.scrollTo({ top: 0, behavior: "smooth" });  
}  
  
function switchMode(mode) {  
  if (mode === "route") {  
    routeModeBtn.classList.add("active");  
    quizModeBtn.classList.remove("active");  
    routeControls.classList.remove("hidden");  
    quizControls.classList.add("hidden");  
    routeModeArea.classList.remove("hidden");  
    quizModeArea.classList.add("hidden");  
  } else {  
    quizModeBtn.classList.add("active");  
    routeModeBtn.classList.remove("active");  
    quizControls.classList.remove("hidden");  
    routeControls.classList.add("hidden");  
    quizModeArea.classList.remove("hidden");  
    routeModeArea.classList.add("hidden");  
    renderQuiz();  
  }  
}  
  
function getProductReactions() {
  return reactions.filter(reaction => {
    const hasValidProduct = reaction.to && compoundMap.has(reaction.from) && compoundMap.has(reaction.to);
    const matchesType = quizTypeFilter === "all" || reaction.type === quizTypeFilter;
    return hasValidProduct && matchesType;
  });
}  
  
function makeAnswerOptions(answerId) {  
  const answerCompound = compoundMap.get(answerId);  
  const allOtherCompounds = compounds.filter(compound => compound.id !== answerId);  
  
  const sameGroup = answerCompound  
    ? allOtherCompounds.filter(compound => compound.group === answerCompound.group)  
    : [];  
  
  const differentGroup = answerCompound  
    ? allOtherCompounds.filter(compound => compound.group !== answerCompound.group)  
    : allOtherCompounds;  
  
  const selected = [  
    answerId,  
    ...shuffleArray(sameGroup).slice(0, 2).map(compound => compound.id),  
    ...shuffleArray(differentGroup).slice(0, 8).map(compound => compound.id)  
  ];  
  
  const unique = [...new Set(selected)].slice(0, 4);  
  
  while (unique.length < 4) {  
    const candidate = pickOne(compounds).id;  
    if (!unique.includes(candidate)) {  
      unique.push(candidate);  
    }  
  }  
  
  return shuffleArray(unique);  
}  
  
function getTargetPathLength() {
  if (quizDifficulty === "basic") {
    return 1;
  }

  if (quizDifficulty === "standard") {
    return 2;
  }

  if (quizDifficulty === "advanced") {
    return 3;
  }

  return pickOne([1, 2, 3]);
}

function getDifficultyLabel() {
  const labels = {
    basic: "基本：1段階",
    standard: "標準：2段階",
    advanced: "発展：3段階",
    random: "ランダム：1〜3段階"
  };

  return labels[quizDifficulty] || labels.standard;
}

function getQuizTypeLabel() {
  if (quizTypeFilter === "all") {
    return "すべて";
  }

  return `${quizTypeFilter}だけ`;
}

function buildRandomReactionPath() {
  let productReactions = getProductReactions();

  if (productReactions.length === 0) {
    quizTypeFilter = "all";
    productReactions = getProductReactions();
    if (quizTypeSelect) {
      quizTypeSelect.value = "all";
    }
  }

  const targetLength = getTargetPathLength();

  for (let fallbackLength = targetLength; fallbackLength >= 1; fallbackLength--) {
    const shuffledFirstReactions = shuffleArray(productReactions);

    for (const firstReaction of shuffledFirstReactions) {
      const path = [firstReaction];
      const usedCompounds = new Set([firstReaction.from, firstReaction.to]);

      let currentCompoundId = firstReaction.to;

      for (let i = 1; i < fallbackLength; i++) {
        const nextCandidates = productReactions.filter(reaction => {
          return reaction.from === currentCompoundId && !usedCompounds.has(reaction.to);
        });

        if (nextCandidates.length === 0) {
          break;
        }

        const nextReaction = pickOne(nextCandidates);

        path.push(nextReaction);
        usedCompounds.add(nextReaction.to);
        currentCompoundId = nextReaction.to;
      }

      if (path.length === fallbackLength) {
        return path;
      }
    }
  }

  return [
    reactions.find(reaction => reaction.from === "benzene" && reaction.to === "nitrobenzene")
  ].filter(Boolean);
}  
  
function generateRandomProblem() {  
  const path = buildRandomReactionPath();  
  
  const answerIds = [  
    path[0].from,  
    ...path.map(reaction => reaction.to)  
  ];  
  
  const clues = path.map((reaction, index) => {  
    const fromSymbol = quizSymbols[index];  
    const toSymbol = quizSymbols[index + 1];  
  
    return `${fromSymbol}に「${reaction.reagent}」を作用させると${toSymbol}になる。反応名：${reaction.name}。`;  
  });  
  
  const answers = answerIds.map((compoundId, index) => {  
    return {  
      symbol: quizSymbols[index],  
      answer: compoundId,  
      options: makeAnswerOptions(compoundId)  
    };  
  });  
  
  const explanation = path.map((reaction, index) => {  
    const fromCompound = getCompound(reaction.from);  
    const toCompound = getCompound(reaction.to);  
  
    return `${quizSymbols[index]}は${fromCompound.name}、${quizSymbols[index + 1]}は${toCompound.name}。${reaction.name}により、${reaction.point}`;  
  });  
  
  return {  
    title: `ランダム反応ルート問題（${getDifficultyLabel()}｜${getQuizTypeLabel()}）`,  
    clues,  
    answers,  
    explanation  
  };  
}  
  
function renderQuiz() {  
  if (!currentQuizProblem) {  
    currentQuizProblem = generateRandomProblem();  
  }  
  
  const problem = currentQuizProblem;  
  
  quizNumber.textContent = `ランダム生成問題 ${generatedProblemCount + 1}｜${getDifficultyLabel()}｜${getQuizTypeLabel()}`;  
  
  quizProblem.innerHTML = `  
    <h3 class="quiz-title">${escapeHTML(problem.title)}</h3>  
    <div class="clue-list">  
      ${problem.clues.map((clue, index) => `  
        <div class="clue">  
          <b>条件${index + 1}：</b>${escapeHTML(clue)}  
        </div>  
      `).join("")}  
    </div>  
  `;  
  
  answerGrid.innerHTML = problem.answers.map(answer => {  
    return `  
      <div class="answer-row">  
        <div class="symbol">${escapeHTML(answer.symbol)}</div>  
        <select id="answer-${escapeHTML(answer.symbol)}">  
          <option value="">選択してください</option>  
          ${answer.options.map(optionId => {  
            const compound = getCompound(optionId);  
            return `<option value="${escapeHTML(optionId)}">${escapeHTML(compound.name)}</option>`;  
          }).join("")}  
        </select>  
      </div>  
    `;  
  }).join("");  
  
  judgeBox.innerHTML = "";  
  explanationBox.innerHTML = `<p class="route-empty">答え合わせ、または解説表示を押すと表示されます。</p>`;  
}  
  
function checkQuizAnswer() {  
  if (!currentQuizProblem) {  
    currentQuizProblem = generateRandomProblem();  
  }  
  
  const problem = currentQuizProblem;  
  
  const results = problem.answers.map(answer => {  
    const select = document.getElementById(`answer-${answer.symbol}`);  
    const selected = select ? select.value : "";  
    const correct = selected === answer.answer;  
  
    return {  
      symbol: answer.symbol,  
      selected,  
      correct,  
      answer: answer.answer  
    };  
  });  
  
  const allCorrect = results.every(result => result.correct);  
  
  judgeBox.innerHTML = results.map(result => {  
    const correctCompound = getCompound(result.answer);  
    const selectedCompound = result.selected ? getCompound(result.selected) : null;  
    const className = result.correct ? "judge-good" : "judge-bad";  
  
    return `  
      <div class="mini-card ${className}">  
        <b>${escapeHTML(result.symbol)}：</b>  
        ${result.correct  
          ? `正解：${escapeHTML(correctCompound.name)}`  
          : `不正解。選択：${selectedCompound ? escapeHTML(selectedCompound.name) : "未選択"} / 正解：${escapeHTML(correctCompound.name)}`  
        }  
      </div>  
    `;  
  }).join("");  
  
  if (allCorrect) {  
    judgeBox.innerHTML = `  
      <div class="mini-card judge-good">  
        <b>全問正解です。</b><br>  
        反応条件から物質を逆算できています。  
      </div>  
    ` + judgeBox.innerHTML;  
  }  
  
  renderExplanation(true);  
}  
  
function renderExplanation(withAnswers = false) {  
  if (!currentQuizProblem) {  
    currentQuizProblem = generateRandomProblem();  
  }  
  
  const problem = currentQuizProblem;  
  
  const answerHTML = withAnswers  
    ? `  
      <div class="mini-card">  
        <b>答え</b><br>  
        ${problem.answers.map(answer => {  
          const compound = getCompound(answer.answer);  
          return `${escapeHTML(answer.symbol)}：${escapeHTML(compound.name)}`;  
        }).join("<br>")}  
      </div>  
    `  
    : "";  
  
  const confirmButtons = problem.answers.map(answer => {  
    const compound = getCompound(answer.answer);  
  
    return `  
      <button class="chip" onclick="openCompoundFromQuiz('${answer.answer}')">  
        ${escapeHTML(answer.symbol)}：${escapeHTML(compound.name)}を通常モードで見る  
      </button>  
    `;  
  }).join("");  
  
  explanationBox.innerHTML = `  
    ${answerHTML}  
    ${problem.explanation.map((line, index) => `  
      <div class="mini-card">  
        <b>解説${index + 1}</b><br>  
        ${escapeHTML(line)}  
      </div>  
    `).join("")}  
  
    <div class="mini-card">  
      <b>確認</b><br>  
      <div class="chips" style="margin-top: 8px;">  
        ${confirmButtons}  
      </div>  
    </div>  
  `;  
}  
  
function openCompoundFromQuiz(id) {  
  currentId = id;  
  compoundSelect.value = currentId;  
  renderRouteMode();  
  switchMode("route");  
  window.scrollTo({ top: 0, behavior: "smooth" });  
}  
  
function nextProblem() {  
  currentQuizProblem = generateRandomProblem();  
  generatedProblemCount += 1;  
  renderQuiz();  
  window.scrollTo({ top: 0, behavior: "smooth" });  
}  
  
compoundSelect.addEventListener("change", () => {  
  currentId = compoundSelect.value;  
  renderRouteMode();  
});  
  
typeFilter.addEventListener("change", () => {  
  renderRouteMode();  
});  
  
backBtn.addEventListener("click", () => {  
  if (history.length === 0) return;  
  
  const last = history.pop();  
  currentId = last.from;  
  lastReaction = history.length > 0 ? history[history.length - 1] : null;  
  compoundSelect.value = currentId;  
  renderRouteMode();  
});  
  
resetBtn.addEventListener("click", () => {  
  history = [];  
  lastReaction = null;  
  renderRouteMode();  
});  
  
searchInput.addEventListener("input", renderSearchResults);  
  
routeModeBtn.addEventListener("click", () => switchMode("route"));  
quizModeBtn.addEventListener("click", () => switchMode("quiz"));  
  
checkAnswerBtn.addEventListener("click", checkQuizAnswer);  
showExplanationBtn.addEventListener("click", () => renderExplanation(true));  
nextProblemBtn.addEventListener("click", nextProblem);

quizTypeSelect.addEventListener("change", () => {
  quizTypeFilter = quizTypeSelect.value;
  currentQuizProblem = generateRandomProblem();
  generatedProblemCount += 1;
  renderQuiz();
});

difficultySelect.addEventListener("change", () => {
  quizDifficulty = difficultySelect.value;
  currentQuizProblem = generateRandomProblem();
  generatedProblemCount += 1;
  renderQuiz();
});  
  
initSelects();  
currentQuizProblem = generateRandomProblem();  
renderRouteMode();  
renderQuiz();  
