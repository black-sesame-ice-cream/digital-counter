const counterElement = document.getElementById('counter');
const upSoundInput = document.getElementById('upSoundInput');
const downSoundInput = document.getElementById('downSoundInput');

// [a, b, c, d, e, f, g]
const SEGMENT_MAP = {
    '0': [1, 1, 1, 1, 1, 1, 0],
    '1': [0, 1, 1, 0, 0, 0, 0],
    '2': [1, 1, 0, 1, 1, 0, 1],
    '3': [1, 1, 1, 1, 0, 0, 1],
    '4': [0, 1, 1, 0, 0, 1, 1],
    '5': [1, 0, 1, 1, 0, 1, 1],
    '6': [1, 0, 1, 1, 1, 1, 1],
    '7': [1, 1, 1, 0, 0, 0, 0],
    '8': [1, 1, 1, 1, 1, 1, 1],
    '9': [1, 1, 1, 1, 0, 1, 1],
};
const SEGMENT_CLASSES = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

const state = {
    count: 0,
    upperLimit: 999,
    lowerLimit: -1,
    leftClickValue: 1, // 左クリックの増減値
    rightClickValue: -1, // 右クリックの増減値
    fontSize: 50,
    color: '#000000',
    limitColor: '#ff794d', // カンスト時の色
    thickness: 0.2, // 数字の太さ
    gap: 0.15, // 数字間のギャップ
    positionX: 50,
    positionY: 50,
    upVolume: 100,
    downVolume: 100,
    upSoundName: 'カーソル移動9.mp3',
    downSoundName: 'カーソル移動12.mp3',
    upSoundURL: 'sounds/カーソル移動9.mp3',
    downSoundURL: 'sounds/カーソル移動12.mp3',
    reset: () => {
        state.count = 0;
        checkLimits(); // 0が範囲外の場合、補正する
        updateDisplay();
    },
    selectUpSound: () => upSoundInput.click(),
    selectDownSound: () => downSoundInput.click(),
};

function checkLimits() {
    if (state.count > state.upperLimit) {
        state.count = state.upperLimit;
    }
    if (state.count < state.lowerLimit) {
        state.count = state.lowerLimit;
    }
    updateDisplay();
}

function render7Segment(text) {
    counterElement.innerHTML = ''; // 古い表示をクリア

    if (text.startsWith('-')) {
        const minusEl = document.createElement('div');
        minusEl.className = 'minus-sign';
        const segmentG = document.createElement('div');
        segmentG.className = 'segment segment-g on';
        minusEl.appendChild(segmentG);
        counterElement.appendChild(minusEl);
        text = text.substring(1); // '-' を削除
    }

    for (const char of text) {
        const digitEl = document.createElement('div');
        digitEl.className = 'digit';
        const segments = SEGMENT_MAP[char] || SEGMENT_MAP['0'];
        
        for (let i = 0; i < segments.length; i++) {
            const segmentEl = document.createElement('div');
            segmentEl.className = `segment segment-${SEGMENT_CLASSES[i]}`;
            if (segments[i]) {
                segmentEl.classList.add('on');
            }
            digitEl.appendChild(segmentEl);
        }
        counterElement.appendChild(digitEl);
    }
}

function updateDisplay() {
    counterElement.classList.add('seven-segment-display');
    render7Segment(String(state.count));
    updateStyle();
}

function updateStyle() {
    // 位置の更新
    counterElement.style.left = `${state.positionX}%`;
    counterElement.style.top = `${state.positionY}%`;

    // スケールの調整
    counterElement.style.fontSize = `${state.fontSize * 0.1}em`;
    
    // 色の更新
    const isAtLimit = state.count === state.upperLimit || state.count === state.lowerLimit;
    const currentColor = isAtLimit ? state.limitColor : state.color;
    counterElement.style.setProperty('--segment-on-color', currentColor);

    // 数字の太さの更新
    document.documentElement.style.setProperty('--thickness', `${state.thickness}em`);

    // 数字間のギャップの更新
    counterElement.style.gap = `${state.gap}em`;

    // テキスト自体は非表示にする
    counterElement.style.color = 'transparent';
}

function playSound(url, volume) {
    if (url) {
        const audio = new Audio(url);
        audio.volume = volume / 100; // 音量を設定
        audio.play().catch(error => console.error("Audio playback failed:", error));
    }
}

counterElement.addEventListener('click', () => {
    if (state.count + state.leftClickValue <= state.upperLimit) {
        state.count += state.leftClickValue;
        updateDisplay();
        playSound(state.upSoundURL, state.upVolume);
    }
});

counterElement.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (state.count + state.rightClickValue >= state.lowerLimit) {
        state.count += state.rightClickValue;
        updateDisplay();
        playSound(state.downSoundURL, state.downVolume);
    }
});

// URLが createObjectURL で生成されたものか判定するヘルパー関数 (追加)
function isBlobURL(url) {
    return url && typeof url === 'string' && url.startsWith('blob:');
}

upSoundInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // 以前のURLがBlob URLの場合のみ revoke (変更)
        if (isBlobURL(state.upSoundURL)) {
            URL.revokeObjectURL(state.upSoundURL);
        }
        state.upSoundURL = URL.createObjectURL(file);
        state.upSoundName = file.name;
        // GUIのファイル名表示を更新 (元のscript.jsには無かったが、動作のために追加)
        const controller = gui.controllers.find(c => c.property === 'upSoundName');
        if (controller) controller.updateDisplay();
    }
});
downSoundInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // 以前のURLがBlob URLの場合のみ revoke (変更)
        if (isBlobURL(state.downSoundURL)) {
            URL.revokeObjectURL(state.downSoundURL);
        }
        state.downSoundURL = URL.createObjectURL(file);
        state.downSoundName = file.name;
        // GUIのファイル名表示を更新 (元のscript.jsには無かったが、動作のために追加)
        const controller = gui.controllers.find(c => c.property === 'downSoundName');
        if (controller) controller.updateDisplay();
    }
});

const gui = new lil.GUI();
gui.add(state, 'count').name('カウンターの値').listen().onChange(updateDisplay);
gui.add(state, 'upperLimit').name('上限値').step(1).onChange(checkLimits);
gui.add(state, 'lowerLimit').name('下限値').step(1).onChange(checkLimits);

const clickFolder = gui.addFolder('クリック設定');
clickFolder.add(state, 'leftClickValue').name('左クリック増減値').step(1);
clickFolder.add(state, 'rightClickValue').name('右クリック増減値').step(1);

gui.add(state, 'reset').name('0にリセット');

const styleFolder = gui.addFolder('スタイル');
styleFolder.add(state, 'fontSize', 1, 150, 1).name('サイズ').onChange(updateStyle);
styleFolder.add(state, 'thickness', 0.01, 0.5, 0.01).name('数字の太さ').onChange(updateStyle);
styleFolder.add(state, 'gap', 0, 1, 0.01).name('数字間のギャップ').onChange(updateStyle);
styleFolder.addColor(state, 'color').name('数字の色').onChange(updateStyle);
styleFolder.addColor(state, 'limitColor').name('数字の色(カンスト)').onChange(updateStyle);

const positionFolder = gui.addFolder('位置');
positionFolder.add(state, 'positionX', 0, 100, 0.1).name('X座標 (%)').onChange(updateStyle);
positionFolder.add(state, 'positionY', 0, 100, 0.1).name('Y座標 (%)').onChange(updateStyle);

const soundFolder = gui.addFolder('サウンド');
const upSoundFolder = soundFolder.addFolder('左クリック音');
upSoundFolder.add(state, 'selectUpSound').name('ファイルを選択');
upSoundFolder.add(state, 'upSoundName').name('ファイル名').listen().disable();
upSoundFolder.add(state, 'upVolume', 0, 100, 1).name('音量');

const downSoundFolder = soundFolder.addFolder('右クリック音');
downSoundFolder.add(state, 'selectDownSound').name('ファイルを選択');
downSoundFolder.add(state, 'downSoundName').name('ファイル名').listen().disable();
downSoundFolder.add(state, 'downVolume', 0, 100, 1).name('音量');

updateDisplay();