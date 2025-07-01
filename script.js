const BASE_URL = "https://api.weatherapi.com/v1";
const API_KEY = "7c86c02e8b9741d787d81044252906"; 
const formInput = document.querySelector(".form");
const list = document.querySelector(".ul-list");

formInput.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
    event.preventDefault();
    const { inputcity, days } = event.target.elements;
    const cityValue = inputcity.value;  
    
    getApi(inputcity.value, days.value)
        .then(data => {
            // console.log(data.forecast.forecastday); 
            list.innerHTML = createMarkup(data.forecast.forecastday,cityValue); 
        })
        .catch(error => {
            console.error("Помилка отримання даних про погоду:", error);
            list.innerHTML = `<li><h1>Ой, щось пішло не так при завантаженні даних про погоду! Будь ласка, спробуйте ще раз.</h1></li>`;
        })
        .finally(()=>formInput.reset());
}

function getApi(inputcity = "", days = 1) {
    const params = new URLSearchParams({
        key: API_KEY,
        q: inputcity,
        days,
        lang: "uk"
    });

    return fetch(`${BASE_URL}/forecast.json?${params}`)
        .then(res => {
            if (!res.ok) {
                if (res.status === 400) {
                    throw new Error("Невідоме місто або некоректний запит. Будь ласка, перевірте назву міста.");
                } else if (res.status === 403) {
                    throw new Error("Помилка авторизації API. Перевірте ваш API ключ.");
                } else {
                    throw new Error(`Помилка мережі: ${res.status} - ${res.statusText}`);
                }
            }
            return res.json();
        });
}

function createMarkup(forecastDaysArray,cityName) {
    return forecastDaysArray.map(dayData => {
        
        const { date, day, hour } = dayData; 
        const dailyConditionText = day.condition.text;
        const dailyConditionIcon = day.condition.icon;
        const avgTempC = day.avgtemp_c;

        
        const hourlyMarkup = hour.map(hourData => {
            const { time, temp_c, condition: { text, icon } } = hourData;
            const timeOnly = time.split(' ')[1];
            console.log(hourData);
            
            return `
                <div class="hourly-item">
                    
                    <p class="hourly-time">${timeOnly}</p>
                    <img src="${icon}" alt="${text}" width="40" height="40">
                    <p class="hourly-temp">${temp_c}°C</p>
                    <p class="hourly-condition">${text}</p>
                </div>
            `;
        }).join(""); 

        return `
            <li class="li-weather">
                <h2 class="weather-city">${cityName}</h2>
                <h2 class="weather-date">${date}</h2>
                <div class="daily-summary">
                    <p>Середня темп.: ${avgTempC}°C</p>
                    <img src="${dailyConditionIcon}" alt="${dailyConditionText}" width="50" height="50">
                    <p>${dailyConditionText}</p>
                </div>
                <h3>Погодинний прогноз:</h3>
                <div class="hourly-forecast-container">
                    ${hourlyMarkup}
                </div>
            </li>
        `;
    }).join("");
}
