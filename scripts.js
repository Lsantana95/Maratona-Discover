const Modal = {
    open(){
        document
        .querySelector(".model-overlay")
        .classList
        .add("active")

    },

    close(){
        document
        .querySelector(".model-overlay")
        .classList
        .remove("active")

    }
}

const Storage = {
    get() {
        return  JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const transactions = {
    all: Storage.get(),

    add(transactions){
        transactions.all.push(transactions)

        App.reload()
    },

    remove(index){
        transactions.all.splice(index, 1)

        App.reload()
    },

    //Soma das entradas
    incomes(){
        let income = 0;
        transactions.all.forEach(transactions => {
            if(transactions.amount >= 0) {
                income += transactions.amount;
            }
            
        });
        return income;
    },

    expenses() {
        let expense = 0;
        transactions.all.forEach(transactions => {
            if(transactions.amount < 0) {
                expense += transactions.amount;
            }
        })
        return expense;
    },

    //Entradas menos as saidas
    total() {
        return transactions.incomes() + transactions.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addtransactions(transactions, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLtransactions(transactions, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

innerHTMLtransactions(transactions, index) {
    const CSSclass = transactions.amount >= 0 ? "income" : "expense"

    const amount = Utils.formatCurrency(transactions.amount)

    const html = `
    <td class="description">${transactions.description}</td>
    <td class="${CSSclass}">${amount}</td>
    <td class="date">${transactions.date}</td>
    <td>
        <img onclick="transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
    </td>
    `

    return html
},

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(transactions.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(transactions.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(transactions.total())        
},

    cleartransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = value * 100

        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    }, 

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-": ""
    
        value = String(value).replace(/\D/g, "")
    
        value = Number(value) / 100
    
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
    
        return signal + value
    },

    formatCurrencyTotal(value) {

        const signal = value >= 0 ? "" : "-"

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt - BR", {
            style: "currency",
            currency: "BRL"

        })

        return `${signal} ${value}`

    },

}

const form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: form.description.value,
            amount: form.amount.value,
            date: form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = form.getValues()
    
        if(description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
            } 
    },

    formatValues() {
        let { description, amount, date} = form.getValues()
    
        amount = Utils.formatAmount(amount)
    
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    savetransactions(transactions) {

        transactions.add(transactions)
    },

    clearFields() {
        form.description.value = ""
        form.amount.value = ""
        form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
    
        try {
            form.validateFields()
            const transactions = form.formatValues()
            form.savetransactions(transactions)
            form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        transactions.all.forEach((transactions, index) => {

            DOM.addtransactions(transactions, index)
        })

        DOM.updateBalance()
    
        Storage.set(transactions.all)
    },
    
    reload() {
        DOM.cleartransactions()
        App.init()
    },
}

App.init()