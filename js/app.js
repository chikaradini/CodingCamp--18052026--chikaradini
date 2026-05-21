(function () {

  var StorageModule = {
    KEYS: {
      TASKS:    'tdld_tasks',
      LINKS:    'tdld_links',
      NAME:     'tdld_name',
      THEME:    'tdld_theme',
      DURATION: 'tdld_duration'
    },

    save: function (key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {}
    },

    load: function (key) {
      try {
        var raw = localStorage.getItem(key);
        if (raw === null) return null;
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    },

    loadArray: function (key) {
      var val = StorageModule.load(key);
      return Array.isArray(val) ? val : [];
    }
  };

  var SettingsModule = {
    name:     '',
    theme:    'dark',
    duration: 25,

    init: function () {
      var savedName     = StorageModule.load(StorageModule.KEYS.NAME);
      var savedTheme    = StorageModule.load(StorageModule.KEYS.THEME);
      var savedDuration = StorageModule.load(StorageModule.KEYS.DURATION);

      SettingsModule.name     = (typeof savedName === 'string' && savedName.trim()) ? savedName.trim() : '';
      SettingsModule.theme    = (savedTheme === 'light') ? 'light' : 'dark';
      SettingsModule.duration = (typeof savedDuration === 'number' && savedDuration >= 1 && savedDuration <= 120)
                                  ? savedDuration : 25;

      SettingsModule.applyTheme();

      var nameInput = document.getElementById('name-input');
      var btnSaveName = document.getElementById('btn-save-name');
      var btnTheme = document.getElementById('btn-theme');
      var durationInput = document.getElementById('timer-duration-input');
      var btnSetDuration = document.getElementById('btn-set-duration');

      if (nameInput) nameInput.value = SettingsModule.name;
      if (durationInput) durationInput.value = SettingsModule.duration;

      if (btnSaveName) {
        btnSaveName.addEventListener('click', function () {
          var val = nameInput ? nameInput.value.trim() : '';
          SettingsModule.name = val;
          StorageModule.save(StorageModule.KEYS.NAME, val);
          GreetingModule.render();
        });
      }

      if (nameInput) {
        nameInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            var val = nameInput.value.trim();
            SettingsModule.name = val;
            StorageModule.save(StorageModule.KEYS.NAME, val);
            GreetingModule.render();
          }
        });
      }

      if (btnTheme) {
        btnTheme.addEventListener('click', function () {
          SettingsModule.theme = (SettingsModule.theme === 'dark') ? 'light' : 'dark';
          StorageModule.save(StorageModule.KEYS.THEME, SettingsModule.theme);
          SettingsModule.applyTheme();
        });
      }

      if (btnSetDuration) {
        btnSetDuration.addEventListener('click', function () {
          SettingsModule.setDuration(durationInput);
        });
      }

      if (durationInput) {
        durationInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            SettingsModule.setDuration(durationInput);
          }
        });
      }
    },

    setDuration: function (durationInput) {
      var val = durationInput ? parseInt(durationInput.value, 10) : NaN;
      if (isNaN(val) || val < 1 || val > 120) {
        if (durationInput) durationInput.value = SettingsModule.duration;
        return;
      }
      SettingsModule.duration = val;
      StorageModule.save(StorageModule.KEYS.DURATION, val);
      TimerModule.applyDuration(val);
    },

    applyTheme: function () {
      var btnTheme = document.getElementById('btn-theme');
      if (SettingsModule.theme === 'light') {
        document.body.classList.add('light');
        if (btnTheme) btnTheme.textContent = '☀️';
      } else {
        document.body.classList.remove('light');
        if (btnTheme) btnTheme.textContent = '🌙';
      }
    }
  };

  var GreetingModule = {
    getGreeting: function (hour) {
      if (hour >= 5 && hour <= 11) return 'Good Morning';
      if (hour >= 12 && hour <= 17) return 'Good Afternoon';
      return 'Good Evening';
    },

    render: function () {
      var now = new Date();
      var hours = now.getHours();
      var minutes = now.getMinutes();

      var hh = hours < 10 ? '0' + hours : '' + hours;
      var mm = minutes < 10 ? '0' + minutes : '' + minutes;

      var days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      var months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];

      var dayName   = days[now.getDay()];
      var date      = now.getDate();
      var dd        = date < 10 ? '0' + date : '' + date;
      var monthName = months[now.getMonth()];
      var year      = now.getFullYear();

      var greeting = GreetingModule.getGreeting(hours);
      var name     = SettingsModule.name;
      var message  = name ? greeting + ', ' + name + '!' : greeting;

      document.getElementById('greeting-time').textContent    = hh + ':' + mm;
      document.getElementById('greeting-date').textContent    = dayName + ', ' + dd + ' ' + monthName + ' ' + year;
      document.getElementById('greeting-message').textContent = message;
    },

    init: function () {
      GreetingModule.render();
      setInterval(GreetingModule.render, 60000);
    }
  };

  var TimerModule = {
    state: {
      remaining:  1500,
      duration:   1500,
      running:    false,
      intervalId: null
    },

    format: function (seconds) {
      var mm = Math.floor(seconds / 60);
      var ss = seconds % 60;
      return (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss;
    },

    render: function () {
      var display = document.getElementById('timer-display');
      if (display) display.textContent = TimerModule.format(TimerModule.state.remaining);
    },

    applyDuration: function (minutes) {
      if (TimerModule.state.running) return;
      var secs = minutes * 60;
      TimerModule.state.duration  = secs;
      TimerModule.state.remaining = secs;
      TimerModule.render();
    },

    start: function () {
      if (TimerModule.state.running) return;
      TimerModule.state.running    = true;
      TimerModule.state.intervalId = setInterval(TimerModule.tick, 1000);
    },

    tick: function () {
      TimerModule.state.remaining -= 1;
      TimerModule.render();
      if (TimerModule.state.remaining <= 0) TimerModule.onComplete();
    },

    stop: function () {
      clearInterval(TimerModule.state.intervalId);
      TimerModule.state.intervalId = null;
      TimerModule.state.running    = false;
    },

    reset: function () {
      TimerModule.stop();
      TimerModule.state.remaining = TimerModule.state.duration;
      TimerModule.render();
    },

    onComplete: function () {
      TimerModule.stop();
      alert('Pomodoro complete! Time for a break.');
    },

    init: function () {
      var savedDuration = SettingsModule.duration;
      TimerModule.state.duration  = savedDuration * 60;
      TimerModule.state.remaining = savedDuration * 60;
      TimerModule.render();

      var btnStart = document.getElementById('btn-start');
      var btnStop  = document.getElementById('btn-stop');
      var btnReset = document.getElementById('btn-reset');
      if (btnStart) btnStart.addEventListener('click', TimerModule.start);
      if (btnStop)  btnStop.addEventListener('click',  TimerModule.stop);
      if (btnReset) btnReset.addEventListener('click', TimerModule.reset);
    }
  };

  var TaskModule = {
    state: [],

    validate: function (title) {
      return title.trim().length > 0;
    },

    addTask: function (title) {
      var validationMsg = document.getElementById('task-validation-msg');
      if (!TaskModule.validate(title)) {
        if (validationMsg) validationMsg.textContent = 'Task title cannot be empty.';
        return;
      }
      TaskModule.state.push({
        id:        crypto.randomUUID(),
        title:     title.trim(),
        completed: false,
        createdAt: Date.now()
      });
      StorageModule.save(StorageModule.KEYS.TASKS, TaskModule.state);
      TaskModule.render();
    },

    editTask: function (id, newTitle) {
      if (!TaskModule.validate(newTitle)) {
        TaskModule.render();
        return;
      }
      for (var i = 0; i < TaskModule.state.length; i++) {
        if (TaskModule.state[i].id === id) {
          TaskModule.state[i].title = newTitle.trim();
          break;
        }
      }
      StorageModule.save(StorageModule.KEYS.TASKS, TaskModule.state);
      TaskModule.render();
    },

    toggleTask: function (id) {
      for (var i = 0; i < TaskModule.state.length; i++) {
        if (TaskModule.state[i].id === id) {
          TaskModule.state[i].completed = !TaskModule.state[i].completed;
          break;
        }
      }
      StorageModule.save(StorageModule.KEYS.TASKS, TaskModule.state);
      TaskModule.render();
    },

    deleteTask: function (id) {
      TaskModule.state = TaskModule.state.filter(function (t) { return t.id !== id; });
      StorageModule.save(StorageModule.KEYS.TASKS, TaskModule.state);
      TaskModule.render();
    },

    render: function () {
      var list = document.getElementById('task-list');
      if (!list) return;
      list.innerHTML = '';

      TaskModule.state.forEach(function (task) {
        var li = document.createElement('li');

        var btnToggle = document.createElement('button');
        btnToggle.className = 'btn-toggle';
        btnToggle.textContent = task.completed ? '✓' : '○';
        btnToggle.setAttribute('aria-label', task.completed ? 'Mark incomplete' : 'Mark complete');
        btnToggle.addEventListener('click', function () { TaskModule.toggleTask(task.id); });

        var span = document.createElement('span');
        span.className = 'task-title' + (task.completed ? ' completed' : '');
        span.textContent = task.title;

        var btnEdit = document.createElement('button');
        btnEdit.className = 'btn-edit';
        btnEdit.textContent = 'Edit';
        btnEdit.setAttribute('aria-label', 'Edit task');
        btnEdit.addEventListener('click', function () {
          var currentSpan = li.querySelector('.task-title');
          if (!currentSpan) return;
          var previousTitle = currentSpan.textContent;

          var input = document.createElement('input');
          input.type  = 'text';
          input.value = previousTitle;
          li.replaceChild(input, currentSpan);
          input.focus();

          var confirmed = false;

          function confirmEdit() {
            if (confirmed) return;
            confirmed = true;
            var newTitle = input.value;
            if (!TaskModule.validate(newTitle)) { TaskModule.render(); return; }
            TaskModule.editTask(task.id, newTitle);
          }

          function cancelEdit() {
            if (confirmed) return;
            confirmed = true;
            TaskModule.render();
          }

          input.addEventListener('blur', confirmEdit);
          input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter')  { e.preventDefault(); confirmEdit(); }
            if (e.key === 'Escape') { e.preventDefault(); cancelEdit();  }
          });
        });

        var btnDelete = document.createElement('button');
        btnDelete.className = 'btn-delete';
        btnDelete.textContent = '✕';
        btnDelete.setAttribute('aria-label', 'Delete task');
        btnDelete.addEventListener('click', function () { TaskModule.deleteTask(task.id); });

        li.appendChild(btnToggle);
        li.appendChild(span);
        li.appendChild(btnEdit);
        li.appendChild(btnDelete);
        list.appendChild(li);
      });
    },

    init: function () {
      TaskModule.state = StorageModule.loadArray(StorageModule.KEYS.TASKS);
      TaskModule.render();

      var form          = document.getElementById('task-form');
      var input         = document.getElementById('task-input');
      var validationMsg = document.getElementById('task-validation-msg');

      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var title   = input ? input.value : '';
          var isValid = TaskModule.validate(title);
          TaskModule.addTask(title);
          if (isValid && input) input.value = '';
        });
      }

      if (input) {
        input.addEventListener('input', function () {
          if (validationMsg) validationMsg.textContent = '';
        });
      }
    }
  };

  var LinkModule = {
    state: [],

    validateLabel: function (label) { return label.trim().length > 0; },

    validateUrl: function (url) {
      return url.startsWith('http://') || url.startsWith('https://');
    },

    addLink: function (label, url) {
      var validationMsg = document.getElementById('link-validation-msg');
      if (!LinkModule.validateLabel(label) || !LinkModule.validateUrl(url)) {
        if (validationMsg) validationMsg.textContent = 'Please enter a valid label and a URL starting with http:// or https://';
        return;
      }
      LinkModule.state.push({ id: crypto.randomUUID(), label: label.trim(), url: url });
      StorageModule.save(StorageModule.KEYS.LINKS, LinkModule.state);
      LinkModule.render();
    },

    deleteLink: function (id) {
      LinkModule.state = LinkModule.state.filter(function (l) { return l.id !== id; });
      StorageModule.save(StorageModule.KEYS.LINKS, LinkModule.state);
      LinkModule.render();
    },

    render: function () {
      var list = document.getElementById('link-list');
      if (!list) return;
      list.innerHTML = '';

      LinkModule.state.forEach(function (link) {
        var li = document.createElement('li');

        var a = document.createElement('a');
        a.href      = link.url;
        a.target    = '_blank';
        a.rel       = 'noopener noreferrer';
        a.textContent = link.label;
        a.className = 'link-pill';

        var btnDelete = document.createElement('button');
        btnDelete.className = 'btn-delete-link';
        btnDelete.textContent = '✕';
        btnDelete.setAttribute('aria-label', 'Delete link');
        btnDelete.addEventListener('click', function () { LinkModule.deleteLink(link.id); });

        li.appendChild(a);
        li.appendChild(btnDelete);
        list.appendChild(li);
      });
    },

    init: function () {
      LinkModule.state = StorageModule.loadArray(StorageModule.KEYS.LINKS);
      LinkModule.render();

      var form          = document.getElementById('link-form');
      var labelInput    = document.getElementById('link-label-input');
      var urlInput      = document.getElementById('link-url-input');
      var validationMsg = document.getElementById('link-validation-msg');

      if (form) {
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var label   = labelInput ? labelInput.value : '';
          var url     = urlInput   ? urlInput.value   : '';
          var isValid = LinkModule.validateLabel(label) && LinkModule.validateUrl(url);
          LinkModule.addLink(label, url);
          if (isValid) {
            if (labelInput) labelInput.value = '';
            if (urlInput)   urlInput.value   = '';
          }
        });
      }

      if (labelInput) {
        labelInput.addEventListener('input', function () {
          if (validationMsg) validationMsg.textContent = '';
        });
      }

      if (urlInput) {
        urlInput.addEventListener('input', function () {
          if (validationMsg) validationMsg.textContent = '';
        });
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    SettingsModule.init();
    GreetingModule.init();
    TimerModule.init();
    TaskModule.init();
    LinkModule.init();
  });

})();
