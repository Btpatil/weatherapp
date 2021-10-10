//this is an object
const config = {
    countryurl : "https://api.countrystatecity.in/v1/countries",
    //statesurl : https://api.countrystatecity.in/v1/countries/[ciso]/states
    //cityeurl : https://api.countrystatecity.in/v1/countries/[ciso]/states/[siso]/cities
    countrykey : "eGxJdkxCSWtBcUxjMkRBQVpXcFZrSDk1dWZ6ekpQQ1UxRVh3bXRFeA==",
    weatherurl : "https://api.openweathermap.org/data/2.5/",
    weatherkey : "fd834ff020c870dba32a0a1d1ffbd4f6",
};

//getting location of user through GPS
document.addEventListener("DOMContentLoaded", async() => {
    let lon;
    let lat;
    let units = "metric";
    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(async (position)=>
        {
            lon = position.coords.longitude;
            lat = position.coords.latitude;
            
            // console.log(lon,lat );
            const apiEndPoint = `${config.weatherurl}weather?lat=${lat}&lon=${lon}&appid=${config.weatherkey}&units=${units}`;

            const response = await fetch(apiEndPoint);
            if(response.status != 200){
                
                throw new Error(`Something went wrong, status code : ${response.status}`);
            }
            const weather = await response.json();
            //console.log(response);
            displayWeather(weather);
            })
        }
})

//fetching countries in select country //its an arrow function
const getCountries = async (areaName, ...args) => {
    let apiEndPoint = config.countryurl;
    switch(areaName){
        case `countries`:
            apiEndPoint = config.countryurl;
            break;

        case `states`:
            apiEndPoint = `${config.countryurl}/${args[0]}/states`;
            break;

        case `cities`:
            apiEndPoint = `${config.countryurl}/${args[0]}/states/${args[1]}/cities`;
        default:

    }
    const response = await fetch(apiEndPoint, {
        headers: { "X-CSCAPI-KEY": config.countrykey },
      });
      if (response.status != 200) {
        throw new Error(`Something went wrong, status code: ${response.status}`);
      }
      const countries = await response.json();
      return countries;
};


//getting weather information
const getWeather = async (city, countryCode, units = "metric") =>  {
    const apiEndPoint = `${config.weatherurl}weather?q=${city},${countryCode.toLowerCase()}&APPID=${config.weatherkey}&units=${units}`;
    //console.log(apiEndPoint);
    const response = await fetch(apiEndPoint);
    if(response.status != 200){
        throw new Error(`Something went wrong, status code : ${response.status}`);
    }
    const weather = await response.json();
    return weather;
};

const getDate = (unixTimeStamp) => {
     const milisec = unixTimeStamp*1000;
     const dateObj = new Date(milisec);
     const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
     };
     const date = dateObj.toLocaleDateString('en-US',options);
     return date;
};

const displayWeather = (data) => {
    const weatherWidget = `<div class="card alert text-center">
    <div class="card-body">
        <h5 class="card-title fs-1 fst-italic text-center">
            ${data.name}, ${data.sys.country}
        </h5>
        <p class="fs-4">${getDate(data.dt)}</p>
        <div class="tempcard">
            <h6 class="card-subtitle cel mb-2">${data.main.temp}</h6>
            <p class="card-text fs-4 mt-2">Minimum: ${data.main.temp_min}°C Maximum: ${data.main.temp_max}°C</p>
        </div>
        ${data.weather.map(w => `<div class="img-container">
        <img src="http://openweathermap.org/img/wn/${w.icon}@2x.png" id="img"/>
    </div>
    <p class="fs-4">${w.description}</p>`).join("<br/>")}
    </div>
</div>`

weatherdiv.innerHTML = weatherWidget;
}

const countriesDropDownList = document.querySelector("#countrylist");
const statesDropDownList = document.querySelector("#statelist");
const citiesDropDownList = document.querySelector("#citylist");
const weatherdiv = document.querySelector("#weatherwidget");


//calling above function
document.addEventListener("DOMContentLoaded", async () => {
    const countries = await getCountries("countries");
    //console.log(countries);
    let countriesOption = "";
    if(countries){
        countriesOption += `<option value="">Select country</option>`;
        countries.forEach((country) => {
            countriesOption += `<option value="${country.iso2}">${country.name}</option>`;
        });
        countriesDropDownList.innerHTML = countriesOption;
    }
    //list states
    countriesDropDownList.addEventListener("change",async function() {
        const selectedCountryCode = this.value;
        //console.log("selected country code", selectedCountryCode);
        const states = await getCountries("states", selectedCountryCode);
        //console.log(states);
        let statesOption = "";
        if(states){
            statesOption += `<option value="">Select State</option>`;
            states.forEach((state) => {
                statesOption += `<option value="${state.iso2}">${state.name}</option>`;
            });
            statesDropDownList.innerHTML = statesOption;
            statesDropDownList.disabled = false;
        }
    });

    //list of cities
    statesDropDownList.addEventListener("change",async function(){
        const selectedCountryCode = countriesDropDownList.value;
        const selectedStateCode = this.value;
        //console.log("state code is", selectedStateCode);
        const cities = await getCountries("cities", selectedCountryCode, selectedStateCode);
        //console.log(cities);
        let citiesOption = "";
        if(cities){
            citiesOption += `<option value="">Select City</option>`;
            cities.forEach((city) => {
                citiesOption += `<option value="${city.name}">${city.name}</option>`;
            });
            citiesDropDownList.innerHTML = citiesOption;
            citiesDropDownList.disabled = false;
        }
    });

    //select the city to show weather
    citiesDropDownList.addEventListener("change",async function(){
        const selectedCity = this.value;
        //console.log(selectedCity);
        const selectedCountryCode = countriesDropDownList.value;
        const weatherInformation = await getWeather(selectedCity, selectedCountryCode);
        //console.log(weatherInformation);
        displayWeather(weatherInformation);
    }) 

});
