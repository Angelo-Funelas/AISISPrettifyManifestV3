var pageInteracted = false
function getBMattr(bm, attr) {
    return bm.split(`${attr}:`)[1].split(/\r?\n/)[0]
}
function calcHitValue(offset) {
    var OD = parseInt(currentBM.versions[0].od)
    if (offset <= 80 - (6*OD)) {
        combo ++
        return 300
    } else if (offset <= 140 - (8*OD)) {
        combo ++
        return 100
    } else if (offset <= 200 - (10*OD)) {
        combo ++
        return 50
    } else {
        combo = 0
        return 0
    }
}
function popGrade(grade,x,y) {
    var pop_grade = document.createElement('span')
    pop_grade.className = 'pop_grade_combo'
    pop_grade.innerText = grade
    pop_grade.style.left = `${x}%`
    pop_grade.style.top = `${y}%`
    pop_grade.addEventListener('animationend', function(e) {
        e.target.remove()
    })
    playarea.append(pop_grade)
}

function hitNote(note, time) {
    activeNotes.delete(time)
    hitsound.currentTime = 0 
    hitsound.play()
    grade = calcHitValue(Math.abs(time-(audio.currentTime*1000)))
    popGrade(grade, note.dataset.x, note.dataset.y)
    score += grade
    scoreh.innerText = `Score: ${score}`
    comboh.innerText = `Combo: ${combo}x`
    removeNote(note, time, false)
}
function handleMap(data) {
    var bg_events = data.split('Background and Video events')[1].split(/\r?\n/)
    beatmap_data = {
        "processed_i": 6,
        "bmsid": getBMattr(data, 'BeatmapSetID'),
        "title": getBMattr(data, 'Title'),
        "artist": getBMattr(data, 'Artist'),
        "mapper": getBMattr(data, 'Creator'),
        "source": getBMattr(data, 'Source'),
        "mode": getBMattr(data, 'Mode'),
        "bg": bg_events[(bg_events[1].includes(".jpg")||(bg_events[1].includes(".png"))||(bg_events[1].includes(".jpeg")))?1:2].split('"')[1],
        "audio": getBMattr(data, 'AudioFilename').replace(' ',''),
        "versions": [
            {
                "bmid": getBMattr(data, 'BeatmapID'),
                "version": getBMattr(data, 'Version'),
                "od": getBMattr(data, 'OverallDifficulty'),
                "hitobjects": data.split('[HitObjects]')[1].split(/\r?\n/)
            }
        ]
    }
    return beatmap_data
}

const maps = [
    {
        'name': 'xi - FREEDOM DiVE (Pikastar) [Earth]',
        'audio': 'Freedom Dive'
    }
]

function toPosX(x) {
    return x/512*100
}
function toPosY(y) {
    return y/384*100
}
var note_index = 1
var audio = new Audio()
var currentBM, playarea,scoreh, hitsound
var score = 0
var combo = 0
var activeNotes = new Set()
function playBM(map) {
    closeBM()
    playarea = document.createElement('div')
    playarea.id = 'osu-playarea'
    scoreh = document.createElement('h1')
    scoreh.innerText = `Score: 0`
    comboh = document.createElement('h1')
    comboh.innerText = `Combo: 0x`
    closeMsg = document.createElement('p')
    closeMsg.innerText = `Press 'Esc' to close game.`
    highscoreh = document.createElement('p')
    chrome.storage.local.get(['osu_highscore'], function(result) {
        if (result.osu_highscore) {
            highscoreh.innerText = `Highscore: ${result.osu_highscore}`
        } else {
            highscoreh.innerText = `Highscore: 0`
        }
    });
    playarea.append(closeMsg)
    playarea.append(scoreh)
    playarea.append(highscoreh)
    playarea.append(comboh)
    var playareaCont = document.createElement('div')
    playareaCont.id = 'osu-container'
    playareaCont.append(playarea)
    document.body.append(playareaCont)
    var url = chrome.runtime.getURL(`/eggs/fd/${map.name}.osu`)
    hitsound = new Audio(chrome.runtime.getURL(`/eggs/normal-hitnormal.wav`));
    console.log('loading beatmaps')
    score = 0
    combo = 0
    note_index = 1
    fetch(url)
      .then((res) => res.text())
      .then((text) => {
        var bm_data = handleMap(text)
        audio = new Audio(chrome.runtime.getURL(`/eggs/fd/${map.audio}.mp3`));
        audio.volume = 0.5;
        audio.play();
        currentBM = bm_data
        console.log(currentBM)
        window.requestAnimationFrame(tick);
        audio.addEventListener('ended', function() {
            chrome.storage.local.get(['osu_highscore'], function(result) {
                if (!result.osu_highscore || result.osu_highscore < score) {
                    chrome.storage.local.set({osu_highscore: score});
                }
            });
            setTimeout(function() {
                closeBM()
            }, 5000)
        })
       })
      .catch((e) => console.error(e));
}
function closeBM() {
    if (document.querySelector('#osu-container')) {
        document.querySelector('#osu-container').remove()
    }
    if (!audio.paused) {
        audio.pause()
        audio.currentTime = 0
    }
    activeNotes = new Set()
}
document.addEventListener('click', function() {
    pageInteracted = true
})
function removeNote(note, time, breakcombo) {
    note.remove()
    if (activeNotes.has(time) && breakcombo) {
        combo = 0
        comboh.innerText = `Combo: ${combo}x`
        popGrade('❌', note.dataset.x, note.dataset.y)
    }
    activeNotes.delete(time)
}
var lastPosX = 0
var lastPosY = 0
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('keydown', function(e) {
        if (e.key == "Escape") { closeBM() }
    });
})
function tick(timeStamp) {
    var curNote = currentBM.versions[0].hitobjects[note_index].split(',')
    var noteTime = parseInt(curNote[2])
    if ((audio.currentTime*1000)+600>=noteTime) {
        var note = document.createElement('button')
        note.classList.add('bm_note','button01')
        note.innerText = 'Enlist/Delist'
        x = parseInt(curNote[0])
        y = parseInt(curNote[1])
        if (lastPosX == x && lastPosY == y) {
            x += 15
            y += 15
        }
        posx = toPosX(x)
        posy = toPosY(y)
        note.style.left = `${posx}%`
        note.style.top = `${posy}%`
        note.dataset.x = posx
        note.dataset.y = posy
        lastPosX = x
        lastPosY = y
        activeNotes.add(noteTime)
        note.addEventListener('click', function() {
            hitNote(note,noteTime)
        })
        setTimeout(removeNote.bind(null, note, noteTime, true), 800)
        playarea.prepend(note)
        note_index++
    }
  
    // Stop the animation after 2 seconds
    previousTimeStamp = timeStamp;
    window.requestAnimationFrame(tick);
}
  