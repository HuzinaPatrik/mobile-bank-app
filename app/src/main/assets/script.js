/*

 \    /  ._  o  _|_  _|_   _   ._     |_       o
  \/\/   |   |   |_   |_  (/_  | |    |_)  \/  o
                               _           /
 |_|       _   o  ._    _.    |_)   _.  _|_  ._  o  |
 | |  |_|  /_  |  | |  (_|    |    (_|   |_  |   |  |<

*/

let app = Vue.createApp({
    data: function() {
        return {
            editMode: false,

            banks: [
                {
                    id: 'erste',
                    name: 'Erste Bank',
                    img: 'erste.gif',
                    count: 0,
                    maxCount: 100000,
                    inputValue: 0,
                },

                {
                    id: 'otp',
                    name: 'OTP Bank',
                    img: 'otp.png',
                    count: 0,
                    maxCount: 100000,
                    inputValue: 0,
                },

                /*
                {
                    id: 'cib',
                    name: 'Cib Bank',
                    img: 'cib.jpg',
                    count: 0,
                    maxCount: 8000,
                    inputValue: 0,
                },
                 */
            ],

            inputValue: null,
            specialPage: null,
            closeTimeout: false,

            logs: []
        }
    },

    components: {},

    methods: {
        set(key, val) {
            this[key] = val;
        },

        get(key) {
            return this[key]
        },

        addLog(text) {
            this.logs.unshift({
                datum: getCurrentDateText(),
                datumTimestamp: new Date(),
                id: this.logs.length + 1,
                text: text,
            });

            localStorage.setItem('project-logs', JSON.stringify(this.logs));
        },

        removeLog(index) {
            if (this.isConfirmActive())
                return;

            /*this.logs.splice(index, 1);
            localStorage.setItem('project-logs', JSON.stringify(this.logs));*/

            this.setupConfirm({
                id: 'log-delete',
                header: 'Log törlés',
                description: 'Biztosan törölni szeretnéd?',
                buttonAccept: 'Megerősítés',
                buttonDeny: 'Elutasítás',
                index: index,
            });
        },

        getCurrentPercent(data) {
            if (!data)
                return 0;

            return Math.min(100, (data.count / data.maxCount) * 100)
        },

        resetValue(index) {
            if (this.isConfirmActive())
                return;

            const currData = this.banks[index];

            if (currData.count === 0)
                return;

            /*const oldValue = currData.count;
            currData.count = 0;

            const bankCountData = localStorage.getItem('project-banks-new') || '{}';
            let loadedData = JSON.parse(bankCountData);
            if (!loadedData[currData.id])
                loadedData[currData.id] = {};
            loadedData[currData.id].count = currData.count;
            localStorage.setItem('project-banks-new', JSON.stringify(loadedData));

            this.addLog(`${currData.name} nevezetű bank értéke 0-zva (Régi érték: ${oldValue})!`)*/

            this.setupConfirm({
                id: 'bank-value-reset',
                header: 'Bank reset',
                description: 'Biztosan resetelni szeretnéd?',
                buttonAccept: 'Megerősítés',
                buttonDeny: 'Elutasítás',
                currData: currData,
            });
        },

        addValue(index) {
            if (this.isConfirmActive())
                return;

            const currData = this.banks[index];

            if (this.inputValue == null)
                return false;

            const oldValue = currData.count;
            currData.count += this.inputValue;
            this.inputValue = null;

            const bankCountData = localStorage.getItem('project-banks-new') || '{}';
            let loadedData = JSON.parse(bankCountData);
            if (!loadedData[currData.id])
                loadedData[currData.id] = {};
            loadedData[currData.id].count = currData.count;
            localStorage.setItem('project-banks-new', JSON.stringify(loadedData));

            this.addLog(`${currData.name} nevezetű bank értéke változott ${oldValue}-ról/ről ${currData.count}-ra/re!`)
        },

        saveValue(index) {
            if (this.isConfirmActive())
                return;

            const currData = this.banks[index];

            if (currData.inputValue == null)
                return false;

            const oldValue = currData.maxCount;

            currData.maxCount = Number(String(currData.inputValue));

            const bankCountData = localStorage.getItem('project-banks-new') || '{}';
            let loadedData = JSON.parse(bankCountData);
            if (!loadedData[currData.id])
                loadedData[currData.id] = {};
            loadedData[currData.id].maxCount = currData.maxCount;
            localStorage.setItem('project-banks-new', JSON.stringify(loadedData));

            this.addLog(`${currData.name} nevezetű bank maximális értéke változott ${oldValue}-ról/ről ${currData.maxCount}-ra/re!`)

            if (this.editMode)
                this.toggleEditMode();
        },

        toggleEditMode() {
            if (this.isConfirmActive())
                return;

            this.editMode = !this.editMode;

            if (this.editMode) {
                this.banks.forEach((data, index) => {
                    this.banks[index].inputValue = Number(String(this.banks[index].maxCount));
                })
            }
        },

        setupConfirm(data) {
            if (this.specialPage)
                return;

            this.specialPage = data;

            $('.confirm-container').css('display', 'flex');

            setTimeout(() => {
                $('.confirm-container').css('opacity', '1');
            }, 5)
        },

        acceptConfirm() {
            if (this.specialPage || !this.closeTimeout) {
                if (this.specialPage.id === 'log-delete') {
                    this.logs.splice(this.specialPage.index, 1);
                    localStorage.setItem('project-logs', JSON.stringify(this.logs));
                } else if (this.specialPage.id === 'bank-value-reset') {
                    const currData = this.specialPage.currData;

                    const oldValue = currData.count;
                    currData.count = 0;

                    const bankCountData = localStorage.getItem('project-banks-new') || '{}';
                    let loadedData = JSON.parse(bankCountData);
                    if (!loadedData[currData.id])
                        loadedData[currData.id] = {};
                    loadedData[currData.id].count = currData.count;
                    localStorage.setItem('project-banks-new', JSON.stringify(loadedData));

                    this.addLog(`${currData.name} nevezetű bank értéke 0-zva (Régi érték: ${oldValue})!`)
                };

                this.closeConfirm();
            }
        },

        closeConfirm() {
            if (this.specialPage || !this.closeTimeout) {
                this.closeTimeout = true;
                $('.confirm-container').css('opacity', '0');

                setTimeout(() => {
                    $('.confirm-container').css('display', 'none');

                    this.closeTimeout = false;
                    this.specialPage = null;
                }, 200)
            }
        },

        isConfirmActive() {
            return this.specialPage;
        },

        formatNumber(num) {
            if (num) {
                return num.toLocaleString('en-US').replace(/,/g, ' ');
            }

            return num;
        }
    },

    computed: {},

    watch: {},
})

const containerInstance = app.mount('.container');

/* Loading */
document.addEventListener('DOMContentLoaded', function() {
    const storedDataString = localStorage.getItem('project-logs');

    if (storedDataString) {
        const loadedData = JSON.parse(storedDataString);
        containerInstance.set('logs', loadedData)
    }

    const bankCountData = localStorage.getItem('project-banks-new');
    if (bankCountData) {
        const loadedData = JSON.parse(bankCountData);

        for (const key in loadedData) {
            if (loadedData.hasOwnProperty(key)) {
                const value = loadedData[key];

                const index = containerInstance.get('banks').findIndex(data => data.id === key);

                if (index !== -1) {
                    let currData = containerInstance.get('banks')[index];

                    currData.count = value.count || 0;
                    currData.maxCount = value.maxCount || 100000;
                }

            }
        }
    }
});

/*
    Assets
 */

function getCurrentDateText() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}