// ==================== GAME MODULE ====================
// Gamification system for desperdicio.pt

(function() {
  'use strict';

  // ==================== STATE ====================
  const STORAGE_KEY = 'desperdicio_game_state';

  let gameData = null;
  let state = {
    points: 0,
    quizAnswers: {},
    quizCorrect: 0,
    calculatorData: null,
    calculatorCompleted: false,
    challengesCompleted: [],
    achievements: [],
    scrollProgress: 0,
    widgetOpen: false,
    activeTab: 'quiz'
  };

  // ==================== HELPERS ====================
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const esc = s => (s ?? "").toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Could not save game state:', e);
    }
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed };
      }
    } catch (e) {
      console.warn('Could not load game state:', e);
    }
  }

  function getLevel() {
    if (!gameData?.levels) return { level: 1, name: 'Iniciante', progress: 0 };

    const levels = gameData.levels;
    for (let i = levels.length - 1; i >= 0; i--) {
      if (state.points >= levels[i].min_points) {
        const current = levels[i];
        const next = levels[i + 1];
        const progress = next
          ? ((state.points - current.min_points) / (next.min_points - current.min_points)) * 100
          : 100;
        return { ...current, progress: Math.min(progress, 100) };
      }
    }
    return { level: 1, name: 'Iniciante', progress: 0 };
  }

  function addPoints(pts) {
    state.points += pts;
    saveState();
    updateWidget();
    checkAchievements();
  }

  function showNotification(message, type = 'success') {
    const existing = $('.game-notification');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = `game-notification ${type}`;
    notif.innerHTML = `
      <span class="game-notification-icon">${type === 'success' ? '🎉' : type === 'achievement' ? '🏆' : 'ℹ️'}</span>
      <span class="game-notification-text">${esc(message)}</span>
    `;
    document.body.appendChild(notif);

    setTimeout(() => notif.classList.add('visible'), 10);
    setTimeout(() => {
      notif.classList.remove('visible');
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }

  // ==================== ACHIEVEMENTS ====================
  function checkAchievements() {
    if (!gameData?.achievements) return;

    gameData.achievements.forEach(ach => {
      if (state.achievements.includes(ach.id)) return;

      let earned = false;

      // Points-based achievements
      if (ach.points_required && state.points >= ach.points_required) {
        earned = true;
      }

      // Condition-based achievements
      if (ach.condition) {
        switch (ach.condition) {
          case 'quiz_score_pct >= 80':
            const totalQuestions = gameData.quiz?.questions?.length || 10;
            const scorePct = (state.quizCorrect / totalQuestions) * 100;
            if (Object.keys(state.quizAnswers).length >= totalQuestions && scorePct >= 80) {
              earned = true;
            }
            break;
          case 'calculator_completed':
            earned = state.calculatorCompleted;
            break;
          case 'waste_below_pt_avg':
            if (state.calculatorData?.yearlyKg < 184) {
              earned = true;
            }
            break;
          case 'challenges_completed >= 1':
            earned = state.challengesCompleted.length >= 1;
            break;
          case 'challenges_completed >= 6':
            earned = state.challengesCompleted.length >= 6;
            break;
          case 'scroll_complete':
            earned = state.scrollProgress >= 90;
            break;
        }
      }

      if (earned) {
        state.achievements.push(ach.id);
        saveState();
        showNotification(`Conquista desbloqueada: ${ach.title}!`, 'achievement');
      }
    });
  }

  // ==================== QUIZ ====================
  function renderQuiz() {
    if (!gameData?.quiz) return '<p>Quiz em carregamento...</p>';

    const questions = gameData.quiz.questions;
    const answeredCount = Object.keys(state.quizAnswers).length;
    const currentIdx = Math.min(answeredCount, questions.length - 1);
    const allAnswered = answeredCount >= questions.length;

    if (allAnswered) {
      const percentage = Math.round((state.quizCorrect / questions.length) * 100);
      return `
        <div class="quiz-complete">
          <div class="quiz-complete-icon">${percentage >= 80 ? '🏆' : percentage >= 50 ? '👍' : '📚'}</div>
          <div class="quiz-complete-score">${state.quizCorrect}/${questions.length}</div>
          <div class="quiz-complete-pct">${percentage}% correcto</div>
          <p class="quiz-complete-message">
            ${percentage >= 80 ? 'Excelente! És um especialista em desperdício alimentar.' :
              percentage >= 50 ? 'Bom trabalho! Continua a aprender.' :
              'Há muito para descobrir. Lê o editorial para aprender mais!'}
          </p>
          <button class="game-btn" onclick="window.desperdicioGame.resetQuiz()">Repetir Quiz</button>
        </div>
      `;
    }

    const q = questions[currentIdx];
    const answered = state.quizAnswers[q.id] !== undefined;
    const selectedIdx = state.quizAnswers[q.id];
    const isCorrect = selectedIdx === q.correct;

    return `
      <div class="quiz-progress">
        <span>Pergunta ${currentIdx + 1} de ${questions.length}</span>
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${(answeredCount / questions.length) * 100}%"></div>
        </div>
      </div>
      <div class="quiz-question">
        <p class="quiz-question-text">${esc(q.question)}</p>
        <div class="quiz-options">
          ${q.options.map((opt, idx) => {
            let classes = 'quiz-option';
            if (answered) {
              if (idx === q.correct) classes += ' correct';
              else if (idx === selectedIdx) classes += ' wrong';
              classes += ' disabled';
            }
            return `
              <button class="${classes}"
                      data-question="${q.id}"
                      data-index="${idx}"
                      ${answered ? 'disabled' : ''}>
                <span class="quiz-option-letter">${String.fromCharCode(65 + idx)}</span>
                <span class="quiz-option-text">${esc(opt)}</span>
              </button>
            `;
          }).join('')}
        </div>
        ${answered ? `
          <div class="quiz-explanation ${isCorrect ? 'correct' : 'wrong'}">
            <div class="quiz-explanation-header">
              ${isCorrect ? '✓ Correcto!' : '✗ Incorreto'}
              ${isCorrect ? `<span class="quiz-points">+${q.points} pts</span>` : ''}
            </div>
            <p>${esc(q.explanation)}</p>
            <cite>Fonte: ${esc(q.source)}</cite>
          </div>
          <button class="game-btn primary" onclick="window.desperdicioGame.nextQuestion()">
            ${currentIdx < questions.length - 1 ? 'Próxima Pergunta' : 'Ver Resultado'}
          </button>
        ` : ''}
      </div>
    `;
  }

  function answerQuestion(questionId, optionIdx) {
    if (state.quizAnswers[questionId] !== undefined) return;

    const question = gameData.quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    state.quizAnswers[questionId] = optionIdx;
    const isCorrect = optionIdx === question.correct;

    if (isCorrect) {
      state.quizCorrect++;
      addPoints(question.points);
    }

    saveState();
    renderActiveTab();
    checkAchievements();
  }

  function nextQuestion() {
    renderActiveTab();
  }

  function resetQuiz() {
    state.quizAnswers = {};
    state.quizCorrect = 0;
    saveState();
    renderActiveTab();
  }

  // ==================== CALCULATOR ====================
  function renderCalculator() {
    if (!gameData?.calculator) return '<p>Calculadora em carregamento...</p>';

    const calc = gameData.calculator;

    if (state.calculatorCompleted && state.calculatorData) {
      const data = state.calculatorData;
      const comparison = calc.comparison;
      const vsPortugal = data.yearlyKg - comparison.portugal_avg_kg_year;
      const vsEU = data.yearlyKg - comparison.eu_avg_kg_year;

      return `
        <div class="calc-result">
          <div class="calc-result-header">
            <div class="calc-result-value">${data.yearlyKg.toFixed(0)} kg</div>
            <div class="calc-result-label">por ano</div>
          </div>

          <div class="calc-comparison">
            <div class="calc-comparison-item ${vsPortugal < 0 ? 'better' : 'worse'}">
              <span class="calc-comparison-label">vs. Portugal (184 kg)</span>
              <span class="calc-comparison-value">${vsPortugal >= 0 ? '+' : ''}${vsPortugal.toFixed(0)} kg</span>
            </div>
            <div class="calc-comparison-item ${vsEU < 0 ? 'better' : 'worse'}">
              <span class="calc-comparison-label">vs. UE (131 kg)</span>
              <span class="calc-comparison-value">${vsEU >= 0 ? '+' : ''}${vsEU.toFixed(0)} kg</span>
            </div>
          </div>

          <div class="calc-tips">
            <h4>Dicas para reduzir:</h4>
            <ul>
              ${data.topCategories.map(cat => `<li><strong>${cat.name}:</strong> ${cat.tip}</li>`).join('')}
            </ul>
          </div>

          <button class="game-btn" onclick="window.desperdicioGame.resetCalculator()">Recalcular</button>
        </div>
      `;
    }

    return `
      <div class="calc-intro">
        <p>Estima quanto desperdiças por semana em cada categoria:</p>
      </div>
      <form class="calc-form" id="calcForm">
        ${calc.categories.map(cat => `
          <div class="calc-category">
            <label class="calc-category-label">
              <span class="calc-category-icon">${cat.icon}</span>
              <span class="calc-category-name">${esc(cat.name)}</span>
              <span class="calc-category-unit">(${esc(cat.unit)})</span>
            </label>
            <div class="calc-input-row">
              <span class="calc-input-label">Compras:</span>
              <input type="number"
                     name="${cat.id}_buy"
                     class="calc-input"
                     min="0"
                     step="0.5"
                     value="0"
                     placeholder="0">
            </div>
            <div class="calc-input-row">
              <span class="calc-input-label">Deitas fora (%):</span>
              <input type="number"
                     name="${cat.id}_waste"
                     class="calc-input"
                     min="0"
                     max="100"
                     value="${Math.round(cat.average_waste_pct * 100)}"
                     placeholder="0">
            </div>
          </div>
        `).join('')}
        <button type="submit" class="game-btn primary">Calcular</button>
      </form>
    `;
  }

  function calculateWaste(formData) {
    const calc = gameData.calculator;
    let weeklyKg = 0;
    const categoryResults = [];

    calc.categories.forEach(cat => {
      const bought = parseFloat(formData.get(`${cat.id}_buy`)) || 0;
      const wastePct = (parseFloat(formData.get(`${cat.id}_waste`)) || 0) / 100;
      const wastedKg = bought * cat.kg_per_unit * wastePct;
      weeklyKg += wastedKg;

      if (wastedKg > 0) {
        categoryResults.push({
          id: cat.id,
          name: cat.name,
          wastedKg,
          tip: cat.tip
        });
      }
    });

    const yearlyKg = weeklyKg * 52;

    // Sort by waste amount, get top 3
    categoryResults.sort((a, b) => b.wastedKg - a.wastedKg);
    const topCategories = categoryResults.slice(0, 3);

    state.calculatorData = {
      weeklyKg,
      yearlyKg,
      topCategories
    };
    state.calculatorCompleted = true;

    // Award points for completing calculator
    if (!state.achievements.includes('ach_calculator')) {
      addPoints(50);
      showNotification('Calculadora completada! +50 pts', 'success');
    }

    saveState();
    checkAchievements();
    renderActiveTab();
  }

  function resetCalculator() {
    state.calculatorData = null;
    state.calculatorCompleted = false;
    saveState();
    renderActiveTab();
  }

  // ==================== CHALLENGES ====================
  function renderChallenges() {
    if (!gameData?.challenges) return '<p>Desafios em carregamento...</p>';

    const challenges = gameData.challenges.items;
    const completedCount = state.challengesCompleted.length;

    return `
      <div class="challenges-header">
        <span>Completados: ${completedCount}/${challenges.length}</span>
      </div>
      <div class="challenges-list">
        ${challenges.map(ch => {
          const isCompleted = state.challengesCompleted.includes(ch.id);
          return `
            <div class="challenge-card ${isCompleted ? 'completed' : ''}">
              <div class="challenge-content">
                <h4 class="challenge-title">${esc(ch.title)}</h4>
                <p class="challenge-description">${esc(ch.description)}</p>
                <span class="challenge-points">${ch.points} pts</span>
              </div>
              ${isCompleted ?
                '<div class="challenge-check">✓</div>' :
                `<button class="challenge-btn" data-challenge="${ch.id}">Feito!</button>`
              }
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function completeChallenge(challengeId) {
    if (state.challengesCompleted.includes(challengeId)) return;

    const challenge = gameData.challenges.items.find(c => c.id === challengeId);
    if (!challenge) return;

    state.challengesCompleted.push(challengeId);
    addPoints(challenge.points);
    showNotification(`Desafio completado! +${challenge.points} pts`, 'success');

    saveState();
    checkAchievements();
    renderActiveTab();
  }

  // ==================== PROGRESS ====================
  function renderProgress() {
    const level = getLevel();
    const achievements = gameData?.achievements || [];
    const earnedAchievements = achievements.filter(a => state.achievements.includes(a.id));

    return `
      <div class="progress-level">
        <div class="progress-level-badge">
          <span class="progress-level-number">${level.level}</span>
        </div>
        <div class="progress-level-info">
          <div class="progress-level-name">${esc(level.name)}</div>
          <div class="progress-level-bar">
            <div class="progress-level-fill" style="width: ${level.progress}%"></div>
          </div>
          <div class="progress-points">${state.points} pontos</div>
        </div>
      </div>

      <div class="progress-stats">
        <div class="progress-stat">
          <div class="progress-stat-value">${Object.keys(state.quizAnswers).length}</div>
          <div class="progress-stat-label">Perguntas</div>
        </div>
        <div class="progress-stat">
          <div class="progress-stat-value">${state.quizCorrect}</div>
          <div class="progress-stat-label">Correctas</div>
        </div>
        <div class="progress-stat">
          <div class="progress-stat-value">${state.challengesCompleted.length}</div>
          <div class="progress-stat-label">Desafios</div>
        </div>
      </div>

      <div class="progress-achievements">
        <h4>Conquistas (${earnedAchievements.length}/${achievements.length})</h4>
        <div class="achievements-grid">
          ${achievements.map(ach => {
            const earned = state.achievements.includes(ach.id);
            return `
              <div class="achievement-badge ${earned ? 'earned' : 'locked'}" title="${esc(ach.description)}">
                <span class="achievement-icon">${ach.icon}</span>
                <span class="achievement-title">${esc(ach.title)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <button class="game-btn danger" onclick="window.desperdicioGame.resetAll()">Recomeçar Tudo</button>
    `;
  }

  function resetAll() {
    if (!confirm('Tens a certeza? Todo o progresso será perdido.')) return;

    state = {
      points: 0,
      quizAnswers: {},
      quizCorrect: 0,
      calculatorData: null,
      calculatorCompleted: false,
      challengesCompleted: [],
      achievements: [],
      scrollProgress: 0,
      widgetOpen: false,
      activeTab: 'quiz'
    };
    saveState();
    updateWidget();
    renderActiveTab();
    showNotification('Progresso reiniciado', 'info');
  }

  // ==================== WIDGET ====================
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'gameWidget';
    widget.className = 'game-widget';
    widget.innerHTML = `
      <button class="game-widget-toggle" id="gameToggle">
        <span class="game-widget-icon">🎮</span>
        <span class="game-widget-points" id="widgetPoints">${state.points}</span>
      </button>
      <div class="game-widget-panel" id="gamePanel">
        <div class="game-widget-header">
          <h3>Desafio Desperdício Zero</h3>
          <button class="game-widget-close" id="gameClose">&times;</button>
        </div>
        <div class="game-widget-tabs">
          <button class="game-tab active" data-tab="quiz">Quiz</button>
          <button class="game-tab" data-tab="calculator">Calculadora</button>
          <button class="game-tab" data-tab="challenges">Desafios</button>
          <button class="game-tab" data-tab="progress">Progresso</button>
        </div>
        <div class="game-widget-content" id="gameContent">
          <!-- Content rendered here -->
        </div>
      </div>
    `;
    document.body.appendChild(widget);

    // Event listeners
    $('#gameToggle').addEventListener('click', toggleWidget);
    $('#gameClose').addEventListener('click', () => toggleWidget(false));

    // Tab switching
    $$('.game-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        state.activeTab = tab.dataset.tab;
        $$('.game-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderActiveTab();
      });
    });

    // Event delegation for quiz, calculator, challenges
    $('#gameContent').addEventListener('click', handleContentClick);
    $('#gameContent').addEventListener('submit', handleFormSubmit);

    // Initial render
    renderActiveTab();
  }

  function toggleWidget(forceState) {
    const panel = $('#gamePanel');
    const toggle = $('#gameToggle');

    state.widgetOpen = typeof forceState === 'boolean' ? forceState : !state.widgetOpen;

    panel.classList.toggle('open', state.widgetOpen);
    toggle.classList.toggle('active', state.widgetOpen);

    if (state.widgetOpen) {
      renderActiveTab();
    }
  }

  function updateWidget() {
    const pointsEl = $('#widgetPoints');
    if (pointsEl) {
      pointsEl.textContent = state.points;
      pointsEl.classList.add('pulse');
      setTimeout(() => pointsEl.classList.remove('pulse'), 300);
    }
  }

  function renderActiveTab() {
    const content = $('#gameContent');
    if (!content) return;

    switch (state.activeTab) {
      case 'quiz':
        content.innerHTML = renderQuiz();
        break;
      case 'calculator':
        content.innerHTML = renderCalculator();
        break;
      case 'challenges':
        content.innerHTML = renderChallenges();
        break;
      case 'progress':
        content.innerHTML = renderProgress();
        break;
    }
  }

  function handleContentClick(e) {
    // Quiz option click
    const quizOption = e.target.closest('.quiz-option:not(.disabled)');
    if (quizOption) {
      const questionId = quizOption.dataset.question;
      const optionIdx = parseInt(quizOption.dataset.index);
      answerQuestion(questionId, optionIdx);
      return;
    }

    // Challenge complete click
    const challengeBtn = e.target.closest('.challenge-btn');
    if (challengeBtn) {
      completeChallenge(challengeBtn.dataset.challenge);
      return;
    }
  }

  function handleFormSubmit(e) {
    if (e.target.id === 'calcForm') {
      e.preventDefault();
      const formData = new FormData(e.target);
      calculateWaste(formData);
    }
  }

  // ==================== SCROLL TRACKING ====================
  function initScrollTracking() {
    const main = document.querySelector('.main') || document.body;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;

      if (progress > state.scrollProgress) {
        state.scrollProgress = progress;

        // Check for scroll achievement at 90%
        if (progress >= 90 && !state.achievements.includes('ach_reader')) {
          checkAchievements();
        }
      }
    }, { passive: true });
  }

  // ==================== INIT ====================
  async function init() {
    // Load saved state
    loadState();

    // Load game data
    try {
      const response = await fetch('assets/data/game.json');
      gameData = await response.json();
    } catch (e) {
      console.error('Could not load game data:', e);
      return;
    }

    // Create widget
    createWidget();

    // Track scroll progress
    initScrollTracking();

    // Expose API for inline handlers
    window.desperdicioGame = {
      nextQuestion,
      resetQuiz,
      resetCalculator,
      resetAll
    };

    console.log('Game module initialized');
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
