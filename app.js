let currentCity = 
localStorage.getItem("city") || "essling";
let temperatureChart;
let hourlyChart;

let activeAlarm = null;
let triggeredAlarms = {};



const weather = {


essling: {
lat:48.236,
lon:16.551,
name:"🇦🇹 Wien Essling",

temperature:"18°C",

feels:"16°C",

wind:"12 km/h",

rain:"20%",

pressure:"1015 hPa",

humidity:"55%",

sunrise:"05:18",

sunset:"20:42",


report:
"Dzisiaj przyjemny dzień. Możliwy lekki deszcz po południu.",

seaTemperature:null,

dewPoint:"",
rainSum:"",
pressureTrend:"",

hourly:[],

waves:null,
wavePeriod:null,
waveDirection:null,
uv:0,
moon:"",
goldenHour:"",
forecast: {

days:[
"Dzisiaj",
"Jutro",
"Czwartek",
"Piątek"
],

temps:[
18,
22,
25,
21
]

}

},



dziwnow:{

lat:54.028,
lon:14.767,
name:"🇵🇱 Dziwnów",

temperature:"21°C",

feels:"20°C",

wind:"18 km/h",

rain:"10%",

pressure:"1018 hPa",

humidity:"70%",

sunrise:"04:51",

sunset:"21:05",


report:
"Dobry dzień na spacer nad morzem.",

seaTemperature:"18°C",

dewPoint:"",
rainSum:"",
pressureTrend:"",

hourly:[],

waves:null,
wavePeriod:null,
waveDirection:null,
uv:0,
moon:"",
goldenHour:"",
forecast:{

days:[
"Dzisiaj",
"Jutro",
"Czwartek",
"Piątek"
],

temps:[
21,
23,
19,
24
]

}

}

};


function createHourlyChart(){

let city = weather[currentCity];


let ctx =
document
.getElementById("hourlyChart")
.getContext("2d");


if(hourlyChart){
hourlyChart.destroy();
}


hourlyChart = new Chart(ctx,{

type:"line",

data:{


labels:
city.hourly.map(h=>h.time),


datasets:[{

data:
city.hourly.map(h=>h.temp),

borderWidth:2,

tension:0.4,

pointRadius:4,

fill:false

}]


},


options:{


responsive:true,

maintainAspectRatio:false,


plugins:{


legend:{
display:false
}


},


scales:{


y:{

beginAtZero:false

}


}


}


});


}

function loadWeather(){


let city = weather[currentCity];


document.getElementById("cityName").innerHTML =
city.name;


document.getElementById("temperature").innerHTML =
city.temperature;


document.getElementById("feels").innerHTML =
city.feels;
const seaRow = document.getElementById("seaRow");

if(city.seaTemperature){

    seaRow.style.display="block";

    document.getElementById("seaTemp").innerHTML =
    city.seaTemperature;

}else{

    seaRow.style.display="none";

}


document.getElementById("wind").innerHTML =
city.wind;


document.getElementById("rain").innerHTML =
city.rain;


document.getElementById("pressure").innerHTML =
city.pressure;


document.getElementById("humidity").innerHTML =
city.humidity;


document.getElementById("sunrise").innerHTML =
city.sunrise;


document.getElementById("sunset").innerHTML =
city.sunset;


document.getElementById("report").innerHTML =
city.report;


}

async function getWeather(city){

    let c = {


lat:
weather[city].lat,


lon:
weather[city].lon


};


    


    let url =
    `https://api.open-meteo.com/v1/forecast?
latitude=${c.lat}&longitude=${c.lon}
&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,precipitation,dew_point_2m
&hourly=temperature_2m,precipitation_probability,weather_code
&daily=sunrise,sunset,temperature_2m_max,uv_index_max,precipitation_sum,pressure_msl_mean
&timezone=Europe%2FBerlin`;


    url=url.replace(/\s/g,"");


    let response = await fetch(url);

    let data = await response.json();
    



    let weatherData = weather[city];


    weatherData.temperature =
    Math.round(data.current.temperature_2m)+"°C";


    weatherData.feels =
    Math.round(data.current.apparent_temperature)+"°C";


    weatherData.wind =
    Math.round(data.current.wind_speed_10m)+" km/h";


    weatherData.rain =
Math.round(data.current.precipitation)+" mm";
weatherData.rainSum =
data.daily.precipitation_sum[0]+" mm";


    weatherData.pressure =
    Math.round(data.current.pressure_msl)+" hPa";
    let todayPressure =
data.daily.pressure_msl_mean[0];


let tomorrowPressure =
data.daily.pressure_msl_mean[1];


let difference =
tomorrowPressure-todayPressure;


if(difference > 3){

weatherData.pressureTrend =
"↑ Rośnie - poprawa pogody";

}
else if(difference < -3){

weatherData.pressureTrend =
"↓ Spada - możliwa zmiana pogody";

}
else{

weatherData.pressureTrend =
"→ Stabilne";

}


    weatherData.humidity =
    data.current.relative_humidity_2m+"%";
    weatherData.dewPoint =
Math.round(
data.current.dew_point_2m
)+"°C";


    weatherData.sunrise =
    data.daily.sunrise[0].substring(11,16);


    weatherData.sunset =
    data.daily.sunset[0].substring(11,16);



    weatherData.forecast.temps =
    data.daily.temperature_2m_max.slice(0,4);
    weatherData.uv =
Math.round(
data.daily.uv_index_max[0]
);
let currentHour = new Date().getHours();


weatherData.hourly =
data.hourly.temperature_2m
.slice(currentHour,currentHour+12)
.map((temp,index)=>{

return {

time:
data.hourly.time[currentHour+index].substring(11,16),

temp:
Math.round(temp),

rain:
data.hourly.precipitation_probability[currentHour+index]

};

});



    loadWeather();

    createChart();
    createMorningBriefing();
    createHourlyChart();
    showHourlyForecast();

createMorningBriefing();

}


async function getWaves(){

if(currentCity !== "dziwnow")
return;


try{

let response =
await fetch(
"https://marine-api.open-meteo.com/v1/marine?latitude=54.028&longitude=14.767&hourly=wave_height,wave_period,wave_direction&timezone=Europe%2FBerlin"
);


let data =
await response.json();


weather.dziwnow.waves =
Math.round(
data.hourly.wave_height[0]*10
)/10+" m";


weather.dziwnow.wavePeriod =
Math.round(
data.hourly.wave_period[0]
)+" s";


weather.dziwnow.waveDirection =
Math.round(
data.hourly.wave_direction[0]
)+"°";


loadWeather();
createMorningBriefing();


}
catch(error){

console.log(error);

}

}
async function searchCity(){


let query =
document.getElementById("citySearch").value;


if(!query) return;



let url =
`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=pl&format=json`;



let response =
await fetch(url);


let data =
await response.json();



if(!data.results){

alert("Nie znaleziono miasta");

return;

}



let place =
data.results[0];



let id =
place.name
.toLowerCase()
.replaceAll(" ","_");



weather[id]={


name:
"📍 "+place.name+
(place.country ? " 🇺🇳 "+place.country : ""),


temperature:"--",

feels:"--",

wind:"--",

rain:"--",

pressure:"--",

humidity:"--",

sunrise:"--",

sunset:"--",


report:
"",

seaTemperature:null,


dewPoint:"",

rainSum:"",

pressureTrend:"",


hourly:[],


waves:null,

wavePeriod:null,

waveDirection:null,


uv:0,


moon:"",

goldenHour:"",



forecast:{


days:[

"Dzisiaj",

"Jutro",

"Pojutrze",

"Następny"

],


temps:[0,0,0,0]


}


};



weather[id].lat =
place.latitude;


weather[id].lon =
place.longitude;

getWeather(id);

currentCity=id;


localStorage.setItem(
"city",
id
);



getWeather(id);



if(
place.name.toLowerCase()
.includes("dziwn")
){

getSeaTemperature();

getWaves();

}


}
function uvAdvice(uv){

if(uv <=2)
return "Niski. Ochrona nie jest konieczna.";

if(uv <=5)
return "Umiarkowany. Warto użyć kremu SPF.";

if(uv <=7)
return "Wysoki. Zalecana ochrona skóry.";

return "Bardzo wysoki. Unikaj długiego słońca.";

}

function getMoonPhase(){

let date = new Date();

let knownNewMoon =
new Date("2024-01-11");


let days =
(date-knownNewMoon)
/
86400000;


let cycle =
days % 29.53;


if(cycle <3)
return "🌑 Nów";

if(cycle <10)
return "🌒 Przybywający";

if(cycle <17)
return "🌕 Pełnia";

if(cycle <24)
return "🌖 Ubywający";


return "🌘 Stary księżyc";

}
function getGoldenHour(city){

return `
Poranna:
${city.sunrise} - ${addMinutes(city.sunrise,45)}

<br>

Wieczorna:
${subtractMinutes(city.sunset,45)}
- ${city.sunset}
`;

}

function addMinutes(time,min){

let d =
new Date("2000-01-01 "+time);

d.setMinutes(
d.getMinutes()+min
);

return d.toTimeString().substring(0,5);

}


function subtractMinutes(time,min){

let d =
new Date("2000-01-01 "+time);

d.setMinutes(
d.getMinutes()-min
);

return d.toTimeString().substring(0,5);

}
async function getSeaTemperature(){

    if(currentCity !== "dziwnow"){
        weather.dziwnow.seaTemperature = null;
        return;
    }


    try{

        let response = await fetch(
        "https://marine-api.open-meteo.com/v1/marine?latitude=54.028&longitude=14.767&hourly=sea_surface_temperature&timezone=Europe%2FBerlin"
        );


        let data = await response.json();


        let temp =
        data.hourly.sea_surface_temperature[0];


        weather.dziwnow.seaTemperature =
        Math.round(temp)+"°C";


        loadWeather();
        createMorningBriefing();


    }catch(error){

        console.log(error);

    }

}
function createChart(){


let city = weather[currentCity];


let ctx =
document
.getElementById("temperatureChart")
.getContext("2d");



if(temperatureChart){

temperatureChart.destroy();

}



temperatureChart =
new Chart(ctx, {


type:"line",


data:{


labels:
city.forecast.days,


datasets:[{


data:
city.forecast.temps,


borderWidth:2,


tension:0.4,


pointRadius:5,


fill:false


}]


},



options:{


responsive:true,


maintainAspectRatio:false,


plugins:{


legend:{


display:false


}


},



scales:{


y:{


beginAtZero:false,


ticks:{


font:{


size:12


}


}


},


x:{


ticks:{


font:{


size:12


}


}


}


}



}


});



}


function changeCity(city){

currentCity=city;

localStorage.setItem(
"city",
city
);

getWeather(city);
getSeaTemperature();
getWaves();

}




function clock(){

let now=new Date();

document.getElementById("clock").innerHTML =
now.toLocaleString("pl-PL");


}


setInterval(clock,1000);

clock();


loadWeather();





function addEvent(){

let text =
prompt("Nazwa wydarzenia");


let time =
prompt("Godzina np. 15:30");


let sound =
prompt(
"MP3",
"sounds/wydarzenie.mp3"
);


if(!text || !time) return;


let events =
JSON.parse(localStorage.getItem("events")) || [];


events.push({

id:Date.now(),

text:text,

time:time,

sound:sound,

done:false

});


localStorage.setItem(
"events",
JSON.stringify(events)
);


showEvents();


}

function showEvents(){

let box =
document.getElementById("alarms");


let events =
JSON.parse(localStorage.getItem("events")) || [];


box.innerHTML="";


events.forEach(event=>{


box.innerHTML += `

<p>

⏰ ${event.time}

<br>

${event.text}


<button onclick="deleteEvent(${event.id})">
❌
</button>


</p>


`;


});


}
function deleteEvent(id){


let events =
JSON.parse(localStorage.getItem("events")) || [];


events =
events.filter(
event=>event.id!==id
);


localStorage.setItem(
"events",
JSON.stringify(events)
);


showEvents();


}

let playingAudio=null;

function stopEventSound(){

    if(playingAudio){

        playingAudio.pause();

        playingAudio.currentTime=0;

        playingAudio=null;

    }


    let events =
    JSON.parse(localStorage.getItem("events")) || [];


    events =
    events.filter(
        event => !event.done
    );


    localStorage.setItem(
        "events",
        JSON.stringify(events)
    );


    showEvents();


    let button =
    document.getElementById("stopEvent");


    if(button){

        button.remove();

    }

}
function showStopEventButton(){

let box =
document.getElementById("alarms");


if(!document.getElementById("stopEvent")){


box.innerHTML += `

<button id="stopEvent"
onclick="stopEventSound()">

 WYŁĄCZ DŹWIĘK

</button>

`;

}


}

function createMorningBriefing(){

let city = weather[currentCity];


let maxTemp =
Math.max(...city.forecast.temps);



let text = "";


// POWITANIE

text += `
<p>
Dzień dobry.
</p>
`;


// TEMPERATURA

text += `
<p>
Aktualnie:
${city.temperature}

<br>

Odczuwalna:
${city.feels}

</p>
`;



// MAX

text += `
<p>
Maksymalnie dzisiaj:
${maxTemp}°C
</p>
`;



// DESZCZ

text += `
<p>
Deszcz:
${rainAdvice(city.rain)}
</p>
`;



// WIATR

text += `
<p>
Wiatr:
${windAdvice(city.wind)}
</p>
`;



// KOMFORT

text += `
<p>
Komfort:
${comfortAdvice(maxTemp)}
</p>
`;



// MORZE

if(city.seaTemperature){

text += `
<p>
Bałtyk:
${city.seaTemperature}

<br>

Kąpiel:
${seaAdvice(city.seaTemperature)}

</p>
`;

}



// SŁOŃCE

text += `
<p>

Wschód:
${city.sunrise}

<br>

Zachód:
${city.sunset}

</p>
`;


//dodatki uv
text += `

<p>
☀️ UV:
${city.uv}

<br>

${uvAdvice(city.uv)}

</p>

`;


text += `

<p>
🌙 Księżyc:

<br>

${getMoonPhase()}

</p>

`;


text += `

<p>
📸 Złota godzina:

<br>

${getGoldenHour(city)}

</p>

`;

text += `

<p>
💧 Punkt rosy:
${city.dewPoint}

<br>

🌧 Opady dzisiaj:
${city.rainSum}

<br>

📈 Ciśnienie:
${city.pressure}

<br>

${city.pressureTrend}

</p>

`;


// FALE

if(city.waves){

text += `
<p>

🌊 Fale:
${city.waves}

<br>

⏱ Okres:
${city.wavePeriod}

<br>

🧭 Kierunek:
${city.waveDirection}

</p>
`;

}
// FINALNA SUGESTIA

text += `
<p>
${daySuggestion(city)}
</p>
`;



document.getElementById("briefing").innerHTML=text;


}
function rainAdvice(rain){

let value =
parseInt(rain);


if(value>=60){

return "Duża szansa opadów. Weź parasol.";

}


if(value>=30){

return "Możliwy przelotny deszcz.";

}


return "Dzień raczej suchy.";

}
function windAdvice(wind){

let value =
parseInt(wind);


if(value>35){

return "Silny wiatr. Ostrożnie na zewnątrz.";

}


if(value>20){

return "Lekko wietrznie.";

}


return "Spokojne warunki.";

}
function comfortAdvice(temp){


if(temp>=30){

return "Gorąco. Unikaj dużego wysiłku.";

}


if(temp>=24){

return "Ciepły i przyjemny dzień.";

}


if(temp>=16){

return "Warunki komfortowe.";

}


return "Chłodno. Warto mieć kurtkę.";

}
function seaAdvice(temp){


let value =
parseInt(temp);


if(value>=20){

return "Bardzo dobre warunki do kąpieli.";

}


if(value>=18){

return "Kąpiel możliwa.";

}


if(value>=16){

return "Dla osób lubiących chłodną wodę.";

}


return "Woda zimna.";

}
function daySuggestion(city){


let temp =
parseInt(city.temperature);


let rain =
parseInt(city.rain);


if(
temp>18 &&
rain<30
){

return "Dobry dzień na spacer lub aktywność na zewnątrz.";

}


if(rain>50){

return "Lepiej zaplanować aktywność pod dachem.";

}


return "Spokojny dzień. Obserwuj warunki.";

}
function showHourlyForecast(){

let city = weather[currentCity];

let box =
document.getElementById("hourForecast");


if(!box) return;


box.innerHTML="";


city.hourly.forEach(hour=>{


box.innerHTML += `

<p>

⏰ ${hour.time}

<br>

🌡 ${hour.temp}°C

<br>

🌧 ${hour.rain}%

</p>

`;

});


}

function checkEvents(){

    let events =
    JSON.parse(localStorage.getItem("events")) || [];


    let now =
    new Date()
    .toTimeString()
    .substring(0,5);



    events.forEach(event=>{


        if(
    event.time===now &&
    !event.done
){

    playingAudio =
    new Audio(event.sound);


    playingAudio.loop=true;


    playingAudio.play();


    event.done=true;


    localStorage.setItem(
        "events",
        JSON.stringify(events)
    );


    showStopEventButton();

}


    });

}


// START SYSTEMU WYDARZEŃ

setInterval(
checkEvents,
10000
);


showEvents();

function setTheme(theme){


document.body.classList.remove(
"night"
);


if(theme==="night"){

document.body.classList.add(
"night"
);

}


localStorage.setItem(
"theme",
theme
);


}



let savedTheme =
localStorage.getItem("theme");


if(savedTheme==="night"){

document.body.classList.add(
"night"
);

}






getWeather(currentCity);
getSeaTemperature();
getWaves();
showEvents();

setInterval(
checkEvents,
10000
);
setInterval(
getWaves,
3600000
);




