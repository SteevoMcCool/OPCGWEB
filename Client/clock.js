function twoDigit(num){
    if (num < 10) return `0${num}`;
    return num % 100;
}
document.body.querySelectorAll('.clock').forEach(clock=>{
    clock.NOW = 0;
    clock.RUNNER = false
    clock.START = (speed=1) => setInterval(()=>{
        clock.NOW+= (speed > 0);
        clock.innerHTML = `
            ${Math.floor(clock.NOW/60)}:${twoDigit(clock.NOW%60)}
        `
    }, Math.abs(1000 / speed))
})