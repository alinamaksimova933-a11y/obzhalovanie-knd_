document.addEventListener('DOMContentLoaded', function() {

    // ---------- Имитация реестра проверок ----------
    const mockChecks = [
        {
            id: 1,
            type: 'Плановая выездная проверка',
            number: '77230456-2024',
            date: '15.03.2024',
            organ: 'Ростехнадзор',
            inspector: 'Иванов И.И.'
        },
        {
            id: 2,
            type: 'Внеплановая документарная проверка',
            number: '77230891-2024',
            date: '02.04.2024',
            organ: 'Роспотребнадзор',
            inspector: 'Петрова А.С.'
        }
    ];

    // ---------- Загружаем жалобы из localStorage (если есть) ----------
    let complaints = [];
    const storedComplaints = localStorage.getItem('complaints');
    if (storedComplaints) {
        complaints = JSON.parse(storedComplaints);
    } else {
        // Демо‑жалобы для первого посещения
        complaints = [
            {
                id: 1001,
                checkId: 1,
                organ: 'Ростехнадзор',
                text: 'В соответствии со ст. 40 Федерального закона № 248-ФЗ подаю жалобу на решение/действия Ростехнадзора по проверке №77230456-2024 от 15.03.2024, проведённой инспектором Ивановым И.И.\n\nОснование: Нарушение порядка проведения проверки.\n\nПрошу отменить оспариваемый акт/решение и прекратить производство по делу.\nДата: 15.03.2024\nПодпись: [электронная подпись]',
                date: '15.03.2024',
                status: 'pending',
                dueDate: new Date(Date.now() + 10*24*60*60*1000).toISOString()
            },
            {
                id: 1002,
                checkId: 2,
                organ: 'Роспотребнадзор',
                text: 'В соответствии со ст. 40 Федерального закона № 248-ФЗ подаю жалобу на решение/действия Роспотребнадзора по проверке №77230891-2024 от 02.04.2024, проведённой инспектором Петровой А.С.\n\nОснование: Неверное применение норм права.\n\nПрошу отменить оспариваемый акт/решение и прекратить производство по делу.\nДата: 05.04.2024\nПодпись: [электронная подпись]',
                date: '05.04.2024',
                status: 'approved',
                dueDate: new Date(Date.now() - 1*24*60*60*1000).toISOString()
            },
            {
                id: 1003,
                checkId: 2,
                organ: 'Роспотребнадзор',
                text: 'В соответствии со ст. 40 Федерального закона № 248-ФЗ подаю жалобу на решение/действия Роспотребнадзора по проверке №77230891-2024 от 02.04.2024, проведённой инспектором Петровой А.С.\n\nОснование: Отсутствие оснований для проверки.\n\nПрошу отменить оспариваемый акт/решение.\nДата: 10.04.2024\nПодпись: [электронная подпись]',
                date: '10.04.2024',
                status: 'rejected',
                dueDate: new Date(Date.now() + 7*24*60*60*1000).toISOString()
            }
        ];
        localStorage.setItem('complaints', JSON.stringify(complaints));
    }

    // Функция сохранения
    function saveComplaints() {
        localStorage.setItem('complaints', JSON.stringify(complaints));
    }

    let selectedCheckId = null;

    // ---------- Навигация ----------
    const screens = document.querySelectorAll('.screen');
    const navButtons = document.querySelectorAll('.nav-btn');

    function showScreen(screenId) {
        screens.forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        navButtons.forEach(b => b.classList.remove('active'));
        document.querySelector(`.nav-btn[data-screen="${screenId}"]`).classList.add('active');
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            showScreen(this.getAttribute('data-screen'));
        });
    });

    // ---------- Загрузка проверок ----------
    document.getElementById('load-checks-btn').addEventListener('click', function() {
        const listDiv = document.getElementById('checks-list');
        listDiv.innerHTML = '';
        mockChecks.forEach(check => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <h4>${check.type} №${check.number}</h4>
                <p>Дата: ${check.date}</p>
                <p>Орган: ${check.organ}</p>
                <p>Инспектор: ${check.inspector}</p>
            `;
            item.addEventListener('click', () => {
                selectedCheckId = check.id;
                fillComplaintForm(check);
                showScreen('screen-form');
            });
            listDiv.appendChild(item);
        });
    });

    function fillComplaintForm(check) {
        const dataDiv = document.getElementById('auto-filled-data');
        dataDiv.className = 'card';
        dataDiv.innerHTML = `
            <strong>Орган:</strong> ${check.organ}<br>
            <strong>Вид проверки:</strong> ${check.type}<br>
            <strong>Номер проверки:</strong> ${check.number}<br>
            <strong>Дата:</strong> ${check.date}<br>
            <strong>Инспектор:</strong> ${check.inspector}
        `;
        document.getElementById('complaint-text').value = '';
        document.getElementById('grounds-select').value = '';
    }

    // ---------- Генерация проекта жалобы ----------
    document.getElementById('generate-draft-btn').addEventListener('click', function() {
        const groundSelect = document.getElementById('grounds-select');
        const groundText = groundSelect.options[groundSelect.selectedIndex].text;
        if (!selectedCheckId) {
            alert('Сначала выберите проверку на экране «Проверки»');
            return;
        }
        if (!groundSelect.value) {
            alert('Пожалуйста, выберите основание для жалобы');
            return;
        }

        const check = mockChecks.find(c => c.id === selectedCheckId);
        const draft = `В соответствии со ст. 40 Федерального закона № 248-ФЗ подаю жалобу на решение/действия ${check.organ} по проверке №${check.number} от ${check.date}, проведённой инспектором ${check.inspector}.

Основание: ${groundText}.

Прошу отменить оспариваемый акт/решение и прекратить производство по делу.
Дата: ${new Date().toLocaleDateString('ru-RU')}
Подпись: [электронная подпись]`;
        
        document.getElementById('complaint-text').value = draft;
        alert('Проект жалобы сформирован. Вы можете отредактировать текст перед отправкой.');
    });

    // ---------- Отправка жалобы ----------
    document.getElementById('submit-btn').addEventListener('click', function() {
        const text = document.getElementById('complaint-text').value.trim();
        if (!text) {
            alert('Текст жалобы не может быть пустым');
            return;
        }
        if (!selectedCheckId) {
            alert('Нет привязанной проверки');
            return;
        }

        const newComplaint = {
            id: Date.now(),
            checkId: selectedCheckId,
            organ: mockChecks.find(c => c.id === selectedCheckId).organ,
            text: text,
            date: new Date().toLocaleDateString('ru-RU'),
            status: 'pending',
            dueDate: new Date(Date.now() + 20*24*60*60*1000).toISOString()
        };
        complaints.push(newComplaint);
        saveComplaints();

        document.getElementById('complaint-text').value = '';
        document.getElementById('grounds-select').value = '';
        selectedCheckId = null;
        document.getElementById('auto-filled-data').innerHTML = '';

        alert('Жалоба отправлена! Проверьте статус.');
        renderStatusList();
        updateAnalytics();
        showScreen('screen-status');
    });

    // ---------- Отображение статусов ----------
    function renderStatusList() {
        const listDiv = document.getElementById('status-list');
        listDiv.innerHTML = '';
        if (complaints.length === 0) {
            listDiv.innerHTML = '<p>Нет поданных жалоб.</p>';
            return;
        }
        complaints.forEach(comp => {
            const item = document.createElement('div');
            item.className = 'list-item';
            const statusText = comp.status === 'pending' ? 'На рассмотрении' :
                               comp.status === 'approved' ? 'Удовлетворена' : 'Отказано';
            const badgeClass = comp.status === 'approved' ? 'approved' :
                               comp.status === 'rejected' ? 'rejected' : '';
            
            const dueDate = new Date(comp.dueDate);
            const now = new Date();
            const daysLeft = Math.ceil((dueDate - now) / (1000*60*60*24));
            
            item.innerHTML = `
                <h4>Жалоба на ${comp.organ}</h4>
                <p>Подана: ${comp.date}</p>
                <span class="status-badge ${badgeClass}">${statusText}</span>
                ${daysLeft > 0 ? `<p style="margin-top:5px;">Срок для судебного обжалования: <strong>${daysLeft} дн.</strong></p>` : '<p>Срок истёк</p>'}
            `;
            listDiv.appendChild(item);
        });
    }

    // ---------- Аналитика ----------
    function updateAnalytics() {
        const total = complaints.length;
        document.getElementById('total-complaints').textContent = total;
        if (total > 0) {
            const approved = complaints.filter(c => c.status === 'approved').length;
            const perc = Math.round((approved / total) * 100);
            document.getElementById('satisfied').textContent = perc;
        } else {
            document.getElementById('satisfied').textContent = 0;
        }
    }

    renderStatusList();
    updateAnalytics();
});