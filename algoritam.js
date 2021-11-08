let cvorovi = document.getElementsByClassName('graf')[0];
let dodajGranu = false;
let posjecenCvor = [];
let neposjecenCvor = [];
let dist;
let brojCvorova = 0;
let cvoroviZaGranu = [];

const dodajGrane = () => {
    dodajGranu = true;
    document.getElementById('dodaj-grane').disabled = 'true';
    dist = new Array(brojCvorova + 1).fill(Infinity).map(() => new Array(brojCvorova + 1).fill(Infinity));
}

let kreirajCvor = (x, y) => {
    document.querySelector('.klik').style.display = 'none';
    const cvor = document.createElement('div');
    cvor.classList.add('cvor');
    cvor.style.top = `${y}px`;
    cvor.style.left = `${x}px`;
    cvor.style.transform = `translate(-50%,-50%)`;
    cvor.id = brojCvorova;
    cvor.innerText = brojCvorova++;
    cvor.addEventListener('click', (e) => {
        e.stopPropagation() || (window.event.cancelBubble = 'true');
        if (!dodajGranu) return;
        cvor.style.backgroundColor = 'coral';
        cvoroviZaGranu.push(cvor.id);
        if (cvoroviZaGranu.length === 2) {
            pronadjiKoordinateCvorova(cvoroviZaGranu);
            cvoroviZaGranu = [];
        }
    })
    cvorovi.appendChild(cvor);
}
cvorovi.addEventListener('click', (e) => {
    if (dodajGranu) return;
    if (brojCvorova > 12) {
        alert("Graf može imati maksimalno 12 čvorova");
        return;
    }
    console.log(e.x, e.y);
    kreirajCvor(e.x, e.y);
})

const nacrtajGranu = (x1, y1, x2, y2, ar) => {
    const duzina = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    const nagib = (x2 - x1) ? (y2 - y1) / (x2 - x1) : (y2 > y1 ? 90 : -90);
    dist[Number(ar[0])][Number(ar[1])] = Math.round(duzina / 10);
    dist[Number(ar[1])][Number(ar[0])] = Math.round(duzina / 10);

    const linija = document.createElement('div');
    linija.id = Number(ar[0]) < Number(ar[1]) ? `linija-${ar[0]}-${ar[1]}` : `linija-${ar[1]}-${ar[0]}`;
    linija.classList.add('linija');
    linija.style.width = `${duzina}px`;
    linija.style.left = `${x1}px`;
    linija.style.top = `${y1}px`;
    let p = document.createElement('p');
    p.classList.add('tezina-grane');
    p.innerText = Math.round(duzina / 10);
    p.contentEditable = 'true';
    p.inputMode = 'numeric';
    p.addEventListener('blur', (e) => {
        if (isNaN(Number(e.target.innerText))) {
            alert('Unesite validnu dužinu grane');
            return;
        }
        n1 = Number(p.closest('.linija').id.split('-')[1]);
        n2 = Number(p.closest('.linija').id.split('-')[2]);
        dist[n1][n2] = Number(e.target.innerText);
        dist[n2][n1] = Number(e.target.innerText);
    })
    linija.style.transform = `rotate(${
        (x1 > x2) ? Math.PI + Math.atan(nagib) :
            Math.atan(nagib)}rad)`;

    p.style.transform = `rotate(-${
        (x1 > x2) ? Math.PI + Math.atan(nagib) :
            Math.atan(nagib)}rad)`;

    linija.append(p);
    cvorovi.appendChild(linija);
    document.getElementById(cvoroviZaGranu[0]).style.backgroundColor = 'grey';
    document.getElementById(cvoroviZaGranu[1]).style.backgroundColor = 'grey';
}

const pronadjiKoordinateCvorova = (ar) => {
    if (ar[0] === ar[1]) {
        document.getElementById(cvoroviZaGranu[0]).style.backgroundColor = '#FFF';
        cvoroviZaGranu = [];
        return;
    }
    x1 = Number(document.getElementById(ar[0]).style.left.slice(0, -2));
    y1 = Number(document.getElementById(ar[0]).style.top.slice(0, -2));
    x2 = Number(document.getElementById(ar[1]).style.left.slice(0, -2));
    y2 = Number(document.getElementById(ar[1]).style.top.slice(0, -2));
    nacrtajGranu(x1, y1, x2, y2, ar);
}

const pronadjiNajkracePuteve = async (el) => {
    ocistiStariRezultat();
    let pocetniCvor = Number(el.previousElementSibling.value);
    if (pocetniCvor >= brojCvorova || isNaN(pocetniCvor)) {
        alert('Unijeli ste broj veći od broja kreiranih čvorova ili niste unijeli početni čvor');
        return;
    }
    document.getElementById(pocetniCvor).style.backgroundColor = 'black';
    let parent = [];
    parent[pocetniCvor] = -1;
    posjecenCvor = [];
    neposjecenCvor = [];
    for (i = 0; i < brojCvorova; i++) neposjecenCvor.push(i);

    let tezineGrana = [];
    for (i = 0; i < brojCvorova; i++) {
        i === pocetniCvor ? null : (dist[pocetniCvor][i] ? tezineGrana[i] = dist[pocetniCvor][i] : tezineGrana[i] = Infinity);
    }
    tezineGrana[pocetniCvor] = 0;

    let minPutevi = [];
    minPutevi[pocetniCvor] = 0;
    while (neposjecenCvor.length) {
        let mini = tezineGrana.indexOf(Math.min(...tezineGrana));
        posjecenCvor.push(mini);
        promijeniBojuCvora(mini);
        await wait(1500);
        neposjecenCvor.splice(neposjecenCvor.indexOf(mini), 1);

        for (j of neposjecenCvor) {
            if (j === mini) continue;
            promijeniBojuLinije(mini, j);
            await wait(1500);
            if (tezineGrana[j] > dist[mini][j] + tezineGrana[mini]) {
                minPutevi[j] = dist[mini][j] + tezineGrana[mini];
                tezineGrana[j] = dist[mini][j] + tezineGrana[mini];
                parent[j] = mini;
            } else {
                minPutevi[j] = tezineGrana[j];
            }
            vratiBojuLinije(mini, j);
        }
        tezineGrana[mini] = Infinity;
        vratiBojuCvora(mini);
        await wait(1500);
    }
    for (i = 0; i < brojCvorova; i++) parent[i] === undefined ? parent[i] = pocetniCvor : null;
    ispisiPuteve(parent, pocetniCvor);
}


const ispisiPuteve = async (parentNiz, pocetniCvor) => {
    document.getElementsByClassName('rezultat')[0].innerHTML = '';
    for (i = 0; i < brojCvorova; i++) {
        let p = document.createElement('p');
        p.innerText = ("Čvor " + i + " --> " + pocetniCvor);
        await ispisiPut(parentNiz, i, p);
    }
}

const ispisiPut = async (parent, ii, pp) => {
    if (parent[ii] === -1) return;
    await ispisiPut(parent, parent[ii], pp);
    pp.innerText = pp.innerText + " " + ii;

    document.getElementsByClassName('rezultat')[0].style.padding = '1rem';
    document.getElementsByClassName('rezultat')[0].appendChild(pp);

    if (ii < parent[ii]) {
        let tmp = document.getElementById(`linija-${ii}-${parent[ii]}`);
        await obojiLiniju(tmp);
    } else {
        let tmp = document.getElementById(`linija-${parent[ii]}-${ii}`);
        await obojiLiniju(tmp);
    }
}

const obojiLiniju = async (el) => {
    if (el.style.backgroundColor !== 'red') {
        await wait(1000);
        el.style.backgroundColor = 'red';
        el.style.height = '8px';
    }
}
let promijeniBojuLinije = async (i, j) => {
    let tmp = Number(i) < Number(j) ? document.getElementById(`linija-${i}-${j}`) : document.getElementById(`linija-${j}-${i}`);
    if (tmp.style.backgroundColor !== 'yellow') {
        await wait(10);
        tmp.style.backgroundColor = 'yellow';
        tmp.style.height = '8px';
    }
}

let vratiBojuLinije = async (i, j) => {
    let tmp = Number(i) < Number(j) ? document.getElementById(`linija-${i}-${j}`) : document.getElementById(`linija-${j}-${i}`);
    if (tmp.style.backgroundColor !== '#EEE') {
        await wait(10);
        tmp.style.backgroundColor = '#EEE';
        tmp.style.height = '5px';
    }
}

let promijeniBojuCvora = async (i) => {
    let trenutnoRazmatraniCvor = document.getElementById(i);
    if (trenutnoRazmatraniCvor.style.backgroundColor !== 'yellow') {
        await wait(10);
        trenutnoRazmatraniCvor.style.backgroundColor = 'yellow';
    }
}
let vratiBojuCvora = async (i) => {
    let trenutnoRazmatraniCvor = document.getElementById(i);
    if (trenutnoRazmatraniCvor.style.backgroundColor !== 'red') {
        await wait(10);
        trenutnoRazmatraniCvor.style.backgroundColor = 'red';
    }
}


const ocistiStariRezultat = () => {
    document.getElementsByClassName('rezultat')[0].innerHTML = '';
    let linije = document.getElementsByClassName('linija');
    for (linija of linije) {
        linija.style.backgroundColor = '#EEE';
        linija.style.height = '5px';
    }
}

const wait = async (t) => {
    let pr = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('done!')
        }, t)
    });
    res = await pr;
}