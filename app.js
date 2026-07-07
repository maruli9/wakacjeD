let currentCity = 
localStorage.getItem("city") || "essling";
let temperatureChart;

let activeAlarm = null;
let triggeredAlarms = {};



const weather = {


essling: {

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

    let coords = {

        essling:{
            lat:48.236,
            lon:16.551
        },

        dziwnow:{
            lat:54.028,
            lon:14.767
        }

    };


    let c = coords[city];


    let url =
    `https://api.open-meteo.com/v1/forecast?
latitude=${c.lat}&longitude=${c.lon}
&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,precipitation
&daily=sunrise,sunset,temperature_2m_max
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


    weatherData.pressure =
    Math.round(data.current.pressure_msl)+" hPa";


    weatherData.humidity =
    data.current.relative_humidity_2m+"%";


    weatherData.sunrise =
    data.daily.sunrise[0].substring(11,16);


    weatherData.sunset =
    data.daily.sunset[0].substring(11,16);



    weatherData.forecast.temps =
    data.daily.temperature_2m_max.slice(0,4);



    loadWeather();

    createChart();

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

🔕 WYŁĄCZ DŹWIĘK

</button>

`;

}


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





loadWeather();
createChart();
getWeather(currentCity);
getSeaTemperature();

showEvents();

setInterval(
checkEvents,
10000
);




