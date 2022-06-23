const el = document.getElementById('form-select')
const discard = document.getElementById('discard-button')
const table = document.getElementById('table')
const tableSection = document.getElementById('table_section')
const historyButton = document.getElementById('history-button')
const feedButton = document.getElementById('feed-button')
const firstTimeInput = document.getElementById('firstTimeInput')
const secondTimeInput = document.getElementById('secondTimeInput')
const thirdTimeInput = document.getElementById('thirdTimeInput')
const fourthTimeInput = document.getElementById('fourthTimeInput')
const confirm = document.getElementById("confirm-button");
let meals = 0

//main js

el.addEventListener('change', function handleChange(event) {
    if (event.target.value === '1') {
        meals = 1
        document.getElementById("firstTime").style.display = "block";
        document.getElementById("secondTime").style.display = "none";
        document.getElementById("thirdTime").style.display = "none";
        document.getElementById("fourthTime").style.display = "none";
    }
    if (event.target.value === '2') {
        meals = 2
        document.getElementById("firstTime").style.display = "block";
        document.getElementById("secondTime").style.display = "block";
        document.getElementById("thirdTime").style.display = "none";
        document.getElementById("fourthTime").style.display = "none";
    }
    if (event.target.value === '3') {
        meals = 3
        document.getElementById("firstTime").style.display = "block";
        document.getElementById("secondTime").style.display = "block";
        document.getElementById("thirdTime").style.display = "block";
        document.getElementById("fourthTime").style.display = "none";
    }
    if (event.target.value === '4') {
        meals = 4
        document.getElementById("firstTime").style.display = "block";
        document.getElementById("secondTime").style.display = "block";
        document.getElementById("thirdTime").style.display = "block";
        document.getElementById("fourthTime").style.display = "block";
    }
})


const getValues = () => {
    if (meals == 1) {
        if (firstTimeInput.value !== '') {
            return getInputValues(firstTimeInput.value, "-1:-1", "-1:-1", "-1:-1")
        } else {
            alert("enter all values")
            return false;
        }
    }
    if (meals == 2) {
        if (firstTimeInput.value !== '' && secondTimeInput.value !== '') {
            return getInputValues(firstTimeInput.value, secondTimeInput.value, "-1:-1", "-1:-1")
        } else {
            return alert("enter all values")
            return false;
        }
    }
    if (meals == 3) {
        if (firstTimeInput.value !== '' && secondTimeInput.value !== '' && thirdTimeInput.value !== '') {
            return getInputValues(firstTimeInput.value, secondTimeInput.value, thirdTimeInput.value, "-1:-1")
        } else {
            alert("enter all values")
            return false;
        }
    }
    if (meals == 4) {
        if (firstTimeInput.value !== '' && secondTimeInput.value !== '' && thirdTimeInput.value !== '' && fourthTimeInput.value !== '') {
            return getInputValues(firstTimeInput.value, secondTimeInput.value, thirdTimeInput.value, fourthTimeInput.value)
        } else {
            alert("enter all values")
            return false;
        }
    }

}
confirm.addEventListener('click', () => {
    let data = getValues()
    console.log(data != false);
    if (data) {
        post(getValues())
        alert("Feeding times are set")
    }

})

discard.addEventListener('click', () => {
    post("discard_meals")
})


historyButton.addEventListener('click', () => {
    const allHistory = get().then(result => {
        console.log(result);
        if (result.length != 0) {
            tableSection.style.display = "block";
            renderTable(result)
        } else {
            alert("You haven't fed your pet before")
        }

    });
})

feedButton.addEventListener('click', () => {
    post("feed_now")
})

const getInputValues = (firstTimeInput, secondTimeInput, thirdTimeInput, fourthTimeInput) => {

    return {
        firstMealTime: firstTimeInput,
        secondMealTime: secondTimeInput,
        thirdMealTime: thirdTimeInput,
        fourthMealTime: fourthTimeInput
    }
}


//API

const BASE_URL = "http://127.0.0.1:5000/home"

const base = async ({ method = "GET", body = null }) => {
    try {
        const reqParams = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        }

        if (body) {
            reqParams.body = JSON.stringify(body)
        }

        return await fetch(`${BASE_URL}`, reqParams)
    } catch (error) {
        console.error("HTTP ERROR: ", error)
    }
}

const baseRequest = async ({ method = "POST", body }) => {
    try {
        const reqParams = {
            method,
            headers: {
                "Content-Type": "application/json",
            },

        }
        reqParams.body = JSON.stringify(body)

        return await fetch(`${BASE_URL}`, reqParams).then(function (response) {
            console.log(response.status)
            if (response.status === 201) {
                alert("Your Pet Fed")
            }
            if (response.status === 202) {
                alert("Feeding stopped")
            }
        })
    } catch (error) {
        console.error("HTTP ERROR: ", error)
    }
}


const post = (body) => baseRequest({ method: "POST", body })

const get = async () => {
    const rawResponse = await base({ method: "GET" })

    return await rawResponse.json()
}


//dom_utils
const tableTemplate = ({ id, portionSize, nameOfFeed, timestamp }) => `
<tr>
    <th scope="row">${id}</th>
    <td>${portionSize}</td>
    <td>${nameOfFeed}</td>
    <td>${timestamp}</td>
</tr>
`

const addItemToPage = ({ id, portionSize, nameOfFeed, timestamp }) => {
    console.log(portionSize);
    table.insertAdjacentHTML("afterbegin", tableTemplate({ id, portionSize, nameOfFeed, timestamp })
    )
}
const renderTable = (array) => {
    console.log(array);
    table.innerHTML = ""

    for (const item of array) {
        console.log(item);
        addItemToPage(item)
    }
}


