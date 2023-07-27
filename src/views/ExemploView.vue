<script setup>
import { ref, onMounted, onBeforeMount, } from "vue"
import { collection, onSnapshot } from "firebase/firestore";
import { io } from "socket.io-client";

import ConverterMoedasParaFormatoBrasil from "../utils/ConverterMoedasParaFormatoBrasil"

import { socket, } from "@/socket";

const gamerRef = ref([])

const socketIo = io("http://192.168.0.111:4007")

// Firebase
onMounted(() => {
    // console.log("onMounted");
    // onSnapshot(collection(db, 'gamer'), (querySnapshot) => {
    //     const fbGames = []
    //     querySnapshot.forEach((doc) => {
    //         const myGamer = {
    //             id: doc.id,
    //             accumulated: doc.data().accumulated,
    //             first_prize: doc.data().first_prize,
    //             prize_draw: doc.data().prize_draw,
    //             second_prize: doc.data().second_prize,
    //             third_prize: doc.data().third_prize
    //         }
    //         fbGames.push(myGamer)
    //     })
    //     gamerRef.value = fbGames
    // })
})
// VARIAVEIS
const numeroConcursoRef = ref("0")
const melhoresApostasRef = ref([])
const informacoesApostRed = ref(false)
const bolaDaVezRef = ref(0)
const bolasSorteadasArray = ref([])
const minutoAtual = ref("00:00:00")
const minutoAtualizado = ref("00:00:00")

const numerosProcurados = ref([]);

const colorsArray = ref(["bl-azul", "bl-vermelha", "bl-amarela", "bl-azul", "bl-vermelha", "bl-azul"])

socket.on('_GANHADORES_', ({ _GANHADORES_, info }) => {
    melhoresApostasRef.value = []
    melhoresApostasRef.value = _GANHADORES_
    informacoesApostRed.value = info
})

onMounted(() => {
    socket.on("relogio", ({ atual, atualizda }) => {
        minutoAtual.value = atual
        minutoAtualizado.value = atualizda
    })
})


socket.on('number::aposta', data => {
    numeroConcursoRef.value = data
});

const ativo = ref({});
socket.on('__CLEAN__', () => {
    melhoresApostasRef.value = []
    bolasSorteadasArray.value = []
    numerosProcurados.value = []
    ativo.value = {};
});

const numbers = ref(Array.from({ length: 60 }, (_, i) => i + 1));



onMounted(() => {
    socket.on('gamer:total', (resultado) => {
        numerosProcurados.value = [...numerosProcurados.value, resultado]
        marcarPosicoesAtivas()
        bolaDaVezRef.value = resultado
        bolasSorteadasArray.value = [...bolasSorteadasArray.value, resultado]
    });
})

const marcarPosicoesAtivas = () => {
    ativo.value = {};
    for (const numero of numerosProcurados.value) {
        ativo.value[numero] = true;
    }
};

const isAtivo = (numero) => {
    return ativo.value[numero] === true;
};

onBeforeMount(() => {
    socket.emit("/BUSCAR_DADOS_HORA", { data: "ok" })
    socket.on("/BUSCAR_DADOS_HORA", ({ hora_database, horaAtualida }) => {
        minutoAtual.value = hora_database
        minutoAtualizado.value = horaAtualida
    })

})

onBeforeMount(() => {
    socket.emit("/BUSCAR_ULTIMO_ID_GAMER", { data: "BUSCAR_ULTIMO_ID_GAMER" })
    socket.on("/BUSCAR_ULTIMO_ID_GAMER", (data) => {
        numeroConcursoRef.value = data.match_id
    })

})
onBeforeMount(() => {
    socket.emit("/BUSCAR_VALORES_APOSTA", { data: "BUSCAR_VALORES_APOSTA" })
    socket.on("/BUSCAR_VALORES_APOSTA", ({ subtract_premiums, seine, corner, block }) => {
        gamerRef.value = {
            subtract_premiums, seine, corner, block
        }
    })

})

   
    socketIo.on("ATUALIZAR::VALORES::MOEDA", () => {
        socket.emit("/BUSCAR_VALORES_APOSTA", { data: "BUSCAR_VALORES_APOSTA" })
    })

</script>
<template>
    <div class="container-3col overflow-hidden">
        <div class="col-1">
            <div class="golden-line">
                <div class="display-concurso"><span>Concurso Nº</span>{{ numeroConcursoRef }}</div>
            </div>

            <div class="display-hora">
                <div>
                    <h5>hora atual</h5>
                    <h2 class="flex flex-col items-center"><img src="../assets/imagens/clock.svg"> {{ minutoAtual }}</h2>
                </div>
                <div class="flex flex-col items-center">
                    <h5>próximo concurso</h5>
                    <h2 class="flex flex-col items-center"><img src="../assets/imagens/clock.svg"> {{ minutoAtualizado }}
                    </h2>
                </div>
            </div>

            <div class="golden-line">
                <div class="display-acumulado"><span>prêmio acumulado R$</span>{{ ConverterMoedasParaFormatoBrasil('00') }}
                </div>
            </div>

            <ul class="premios">
                <li>
                    <div class="premio"><img src="../assets/imagens/trofeu-1.png"></div>
                    <div class="nome"><span>1º prêmio</span>Sena</div>
                    <div class="valor">{{ ConverterMoedasParaFormatoBrasil(gamerRef.seine) }}</div>
                </li>
                <li>
                    <div class="premio"><img src="../assets/imagens/trofeu-2.png"></div>
                    <div class="nome"><span>2º prêmio</span>Quina</div>
                    <div class="valor">{{ ConverterMoedasParaFormatoBrasil(gamerRef.corner) }}</div>
                </li>
                <li>
                    <div class="premio"><img src="../assets/imagens/trofeu-3.png"></div>
                    <div class="nome"><span>3º prêmio</span>Quadra</div>
                    <div class="valor">{{ ConverterMoedasParaFormatoBrasil(gamerRef.block) }}</div>
                </li>
            </ul>

            <div class="slot-machine">
                <button type="button" class="toggle_btn">Sorteio</button>
            </div>
        </div>

        <div class="col-1">
            <h2 class="title-box">
                <span>Melhores Bilhetes</span>
            </h2>
            <ul class="melhores-cartelas" v-if="melhoresApostasRef.length > 1">
                <li v-for="items in melhoresApostasRef" :key="items?.id">
                    <div class="nome"><span>{{ items?.id }}</span> {{ items?.name }}</div>
                    <div class="bolas">
                        <div class="ativo" v-for="(item, index) in items.namber_round" :key="index">{{ item }}</div>
                    </div>
                </li>
            </ul>
            <span v-else class="text-white font-semibold text-center">Concurso sem participantes...</span>
        </div>
        <div class="col-1">
            <div class="display-bolas">
                <div class="box-sorteados">
                    <div class="box-contents">
                        <h2 class="title-box">Números sorteados</h2>
                        <ul class="bolas-sena">
                            <li v-for="(item, i) in bolasSorteadasArray" :key="i">
                                <div class="bola bl-verde" :class="colorsArray[i]"><span>{{ item }}</span></div>
                            </li>
                            <template v-if="Number(bolasSorteadasArray.length != 6)">
                                <li v-for="i in (6 - Number(bolasSorteadasArray.length > 0 ? bolasSorteadasArray.length : 0))"
                                    :key="i">
                                    <div class="bola vazio"><span>00</span></div>
                                </li>
                            </template>

                        </ul>
                    </div>
                </div>

                <div class="bola-sorteada">
                    <div class="bola-display">
                        <div class="bola bl-laranja"><span>{{ bolaDaVezRef }}</span></div>
                    </div>
                </div>
            </div>

            <ul class="numeros-box">
                <li v-for="(number, index) in numbers" :key="index" :class="{ ativo: isAtivo(index + 1) }">{{ number }}</li>
            </ul>

        </div>
    </div>

    <div class="modal">
        <div class="modal_wrapper">
            <div class="modal_content">
                <div class="modal-interior">
                    <div class="modal_head">
                        <h1 class="heading">BILHETE PREMIADO</h1>
                    </div>
                    <div class="modal_body">
                        <div id="app">
                            <div class="doors">
                                <div class="door">
                                    <div class="boxes"><!-- <div class="box-slot">?</div> --></div>
                                </div>
                                <div class="door">
                                    <div class="boxes"><!-- <div class="box-slot">?</div> --></div>
                                </div>
                                <div class="door">
                                    <div class="boxes"><!-- <div class="box-slot">?</div> --></div>
                                </div>
                                <div class="door">
                                    <div class="boxes"><!-- <div class="box-slot">?</div> --></div>
                                </div>
                                <div class="door">
                                    <div class="boxes"><!-- <div class="box-slot">?</div> --></div>
                                </div>
                                <div class="door">
                                    <div class="boxes"><!-- <div class="box-slot">?</div> --></div>
                                </div>
                            </div>

                            <div class="buttons">
                                <button id="spinner">Rodar</button>
                                <button id="reseter">Zerar</button>
                            </div>
                        </div>
                    </div>
                    <div class="modal_foot">
                        <button type="button" class="btn close_btn">X</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
/* CSS */
@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;700;900&display=swap');


/*** CSS RESET **/

/* Box sizing rules */
*,
*::before,
*::after {
    box-sizing: border-box;
}

/* Remove default margin */
* {
    margin: 0;
    padding: 0;
    font: inherit;
}

/* Remove list styles on ul, ol elements with a list role, which suggests default styling will be removed */
ul[role='list'],
ol[role='list'] {
    list-style: none;
}

html,
body {
    height: 100%;
}

/* Set core root defaults */
html:focus-within {
    scroll-behavior: smooth;
}

/* Set core body defaults */
body {
    text-rendering: optimizeSpeed;
    line-height: 1.5;
}

/* A elements that don't have a class get default styles */
a:not([class]) {
    text-decoration-skip-ink: auto;
}

/* Make images easier to work with */
img,
picture,
svg {
    max-width: 100%;
    display: block;
}

body {
    font-family: 'Red Hat Display', sans-serif !important;
    background-color: #fff;
    background-image: url('../assets/imagens/bg.jpg');
    background-position: center top;
    background-repeat: no-repeat;
    background-attachment: fixed;
}

.container-3col {
    padding: 20px;
    display: grid;
    grid-template-columns: 1fr 1.4fr 1.4fr;
    grid-auto-flow: column;
    gap: 1em;
}

.col-1 {
    background: rgba(22, 67, 115, 0.76);
    border-radius: 14px;
    padding: 10px;
}

.golden-line {
    background: linear-gradient(180deg, rgba(223, 181, 119, 1) 0%, rgba(180, 133, 74, 1) 31%, rgba(250, 222, 157, 1) 65%, rgba(153, 114, 71, 1) 100%);
    padding: 2px;
    margin-bottom: 1rem;
    border-radius: 10px;
}

h2.title-box {
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 2rem;
    margin-bottom: .4rem;
    color: #ffd667;
}

.numeros-box {
    display: grid;
    list-style-type: none;
    padding: 10px;
    background: #0b2942;
    gap: .42em;
    grid-template-columns: repeat(5, 1fr);
    border-radius: 8px;
}

.numeros-box li {
    background: #afd6ff;
    color: #000;
    font-weight: 900;
    text-align: center;
    font-size: 1.5rem;
    line-height: 2.5rem;
    border-radius: 4px;
}

.numeros-box li.ativo {
    background: #f00;
    color: #fff;
}

.display-concurso {
    display: block;
    background: #000;
    color: #e4bb4e;
    text-align: center;
    font-weight: 900;
    font-size: 3.5rem;
    line-height: 3.5rem;
    border-radius: 8px;
    padding: .8rem;
    box-shadow: inset 0 0 11px 5px #515151;
}

.display-concurso span {
    display: block;
    font-size: 1.2rem;
    line-height: 1.5rem;
    color: #fff;
    font-weight: 700;
    text-transform: uppercase;
}

.display-acumulado {
    display: block;
    background: #011c40;
    color: #a4c647;
    text-align: center;
    font-weight: 900;
    font-size: 3rem;
    line-height: 3rem;
    border-radius: 8px;
    padding: .8rem;
    box-shadow: inset 0 0 11px 5px #3b619b;
}

.display-acumulado span {
    display: block;
    font-size: 1.3rem;
    line-height: 1.65rem;
    color: #fff;
    font-weight: 700;
    text-transform: uppercase;
}

.display-hora {
    display: grid;
    grid-gap: .75em;
    grid-template-columns: 1fr 1fr;
    margin-bottom: 1rem;
}

.display-hora div {
    padding: 6px;
    background: #000;
    color: #fff;
    text-align: center;
    border-radius: 8px;
}

.display-hora h5 {
    text-transform: uppercase;
    font-weight: 700;
    font-size: .75rem;
    color: #ffd667;
}

.display-hora h2 {
    font-weight: 700;
    font-size: 1.6rem;
    line-height: 2.1rem;
}

.display-hora img {
    width: 19px;
    height: auto;
    display: inline-block;
}

ul.premios {
    list-style-type: none;
    /*background: #c6c6c6;
	padding: 6px;
	border-radius: 6px;*/
}

ul.premios li {
    background: #21629b;
    padding: 6px;
    border-radius: 6px;
    margin: 0 0 6px 0;
    display: grid;
    grid-gap: .6em;
    grid-template-columns: 1fr 2.2fr 4fr;
}

ul.premios li .nome {
    color: #e4bb4e;
    font-size: 1.4rem;
    padding: 5px 0 0 2px;
    font-weight: 700;
    line-height: 1.4rem;
}

ul.premios li .nome span {
    color: #fff;
    font-size: .75rem;
    line-height: .85rem;
    display: block;
    text-transform: uppercase;
}

ul.premios li .valor {
    background: #000;
    color: #fff;
    font-size: 1.36rem;
    text-align: right;
    border-radius: 4px;
    padding: 5px 6px;
    line-height: 2.3rem;
    font-weight: 700;
}

.cartela {
    font-size: 2rem;
    text-align: center;
}

.premio img {
    margin: 3px 0 0 2px;
}

/*.premio-1 img  {
	background-image: linear-gradient(90deg, rgba(193,162,61,1) 0%, rgba(255,211,114,1) 35%, rgba(124,96,46,1) 55%, rgba(204,153,32,1) 74%, rgba(145,96,9,1) 100%); 
}
.premio-2 img {
	background-image: linear-gradient(90deg, rgba(190,190,190,1) 0%, rgba(223,223,223,1) 35%, rgba(119,119,119,1) 55%, rgba(201,201,201,1) 74%, rgba(140,140,140,1) 100%); 
}
.premio-3 img {
	background-image: linear-gradient(90deg, rgba(193,125,61,1) 0%, rgba(255,185,114,1) 35%, rgba(124,75,46,1) 55%, rgba(204,130,32,1) 74%, rgba(145,89,9,1) 100%);
}*/

.display-bolas {
    display: grid;
    grid-gap: .75em;
    grid-template-columns: 3fr 1fr;
    margin-bottom: 1rem;
}

.box-sorteados {
    background: linear-gradient(180deg, rgba(223, 181, 119, 1) 0%, rgba(180, 133, 74, 1) 31%, rgba(250, 222, 157, 1) 65%, rgba(153, 114, 71, 1) 100%);
    border-radius: 8px;
    padding: 2px;
}

.box-contents {
    background: #1d4e82;
    padding: 8px;
    border-radius: 6px;
}

ul.bolas-sena {
    list-style-type: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}

ul.bolas-sena li {
    background: linear-gradient(180deg, rgb(8, 46, 87) 0%, rgb(108, 145, 185) 100%);
    border-radius: 3.5rem;
    text-align: center;
    height: 3.5rem;
    width: 3.5rem;
    padding: 3px;
}

ul.bolas-sena li .bola {
    border: 1px solid #274c7b;
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

ul.bolas-sena li .bola span {
    background: #ffffffe5;
    border-radius: 2.2rem;
    font-size: 1.2rem;
    font-weight: 900;
    line-height: 2rem;
    width: 2rem;
    height: 2rem;
    display: inline-block;
    margin-top: 8px;
}

ul.bolas-sena li .vazio {
    background: transparent;
}

ul.bolas-sena li .vazio span {
    background: transparent;
    color: #1f3a57;
}

.bl-verde {
    background: radial-gradient(circle at 65% 20%, rgba(227, 251, 195, 1) 0%, rgba(134, 195, 80, 1) 30%, rgba(64, 111, 8, 1) 65%, rgba(169, 201, 131, 1) 100%);
}

.bl-azul {
    background: radial-gradient(circle at 65% 20%, rgb(195, 230, 251) 0%, rgb(35, 160, 198) 30%, rgb(0, 110, 145) 60%, rgb(180, 223, 225) 100%);
}

.bl-vermelha {
    background: radial-gradient(circle at 65% 20%, rgb(251, 205, 205) 0%, rgb(221, 20, 20) 35%, rgb(162, 0, 0) 65%, rgb(228, 173, 173) 90%);
}

.bl-amarela {
    background: radial-gradient(circle at 65% 20%, rgb(251, 247, 218) 0%, rgb(242, 204, 0) 40%, rgb(185, 149, 5) 65%, rgb(255, 241, 186) 90%);
}

.bl-laranja {
    background: radial-gradient(circle at 65% 20%, rgb(251, 230, 218) 0%, rgb(242, 125, 0) 40%, rgb(185, 73, 5) 65%, rgb(255, 212, 186) 90%);
}

.bola-sorteada {
    border-radius: 8px;
    text-align: center;
}

.bola-sorteada .bola-display {
    background: linear-gradient(180deg, rgb(10, 45, 83) 30%, rgb(105, 142, 182) 100%);
    border-radius: 50%;
    text-align: center;
    padding: 10px;
    display: inline-block;
    width: 7.2rem;
    height: 7.2rem;
}

.bola-sorteada .bola {
    width: 6rem;
    height: 6rem;
    border-radius: 3rem;
    display: inline-block;
}

.bola-sorteada .bola span {
    display: inline-block;
    background: #ffffffc5;
    font-size: 2rem;
    color: #000;
    font-weight: 900;
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 1.8rem;
    line-height: 3.6rem;
    margin-top: 18px;
}

ul.cartelas {
    list-style-type: none;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: .3em;
}

ul.cartelas li {
    display: grid;
}

ul.cartelas li .header {
    background: #072448;
    color: #e4bb4e;
    padding: 4px 8px;
    display: block;
    border-radius: 4px 4px 0 0;
    font-size: .9rem;
    font-weight: 700;
}

ul.cartelas li .header span {
    font-size: .75rem;
    text-transform: uppercase;
    color: #fff;
}

ul.cartelas li .cartela-box {
    background: #577fa2;
    padding: 6px 8px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-gap: .2em;
    border-radius: 0 0 4px 4px;
}

ul.cartelas li .cartela-box div {
    background: #fff;
    font-size: .9rem;
    font-weight: 700;
    text-align: center;
    border-radius: 4px;
}

ul.cartelas li .cartela-box div.ativo {
    background: #cbeaad;
}

ul.cartelas li .cartela-box div.vazio {
    background: #a1bad0;
}

/* MELHORES CARTELAS */
ul.melhores-cartelas {
    list-style-type: none;
    display: grid;
    grid-gap: .28em;
    background: #0e2848;
    padding: 5px;
    border-radius: 8px;
}

ul.melhores-cartelas li {
    background: #124673;
    padding: 6px;
    border-radius: 4px;
    display: grid;
    grid-template-columns: 1.2fr 1fr;
}

ul.melhores-cartelas li:nth-child(odd) {
    background: #21629b;
}

ul.melhores-cartelas li .nome {
    font-size: .9rem;
    line-height: 1.7rem;
    font-weight: 700;
    color: #fff;
    text-transform: uppercase;
}

ul.melhores-cartelas li .nome span {
    font-size: .85rem;
    padding: 1px 5px;
    background: #000;
    color: #fff;
    border-radius: .3rem;
    margin-right: 6px;
}

ul.melhores-cartelas li .bolas {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-gap: .2em;
}

ul.melhores-cartelas li .bolas div {
    font-size: 1rem;
    line-height: 1.2rem;
    color: #444;
    border-radius: 4px;
    text-align: center;
    font-weight: 900;
    background: #6399c8;
    padding: 4px;
}

ul.melhores-cartelas li .bolas div.ativo {
    background: #fff;
    color: #000;
}

/* MODAL SORTEIO */
.modal {
    background-color: rgba(0, 0, 0, 0.6);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.2s ease;
}

.modal.open {
    pointer-events: all;
    opacity: 1;
    visibility: visible;
}

.modal_wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1.5rem;
    min-height: calc(100% - 3rem);
}

@media (max-width: 575.98px) {
    .modal_wrapper {
        margin: 0.5rem;
        min-height: calc(100% - 1rem);
    }
}

.modal_content {
    position: relative;
    background: linear-gradient(180deg, rgba(223, 181, 119, 1) 0%, rgba(180, 133, 74, 1) 31%, rgba(250, 222, 157, 1) 65%, rgba(153, 114, 71, 1) 100%);
    box-shadow: 0 16px 15px -5px rgba(9, 18, 41, 0.69);
    width: 100vw;
    max-width: 680px;
    padding: 3px;
    border-radius: 12px;
    text-align: center;
    overflow: hidden;
    transform: scale(0);
    transition: transform 0.4s ease;
}

.modal_content h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #fff;
}

.modal-interior {
    background-image: url('../assets/imagens/bg.jpg');
    background-size: cover;
    padding: 15px;
    border-radius: 9px;
}

.modal.open .modal_content {
    transform: scale(1);
}

.modal_body {
    margin: 2rem 0 0;
}

.modal_body p {
    font-size: 1.2rem;
    line-height: 1.6;
    letter-spacing: 0.8px;
}

.close_btn {
    font-size: 1.2rem;
    position: absolute;
    top: 10px;
    right: 7px;
    border-radius: 50%;
    line-height: 1.4rem;
    padding: 6px 10px;
    font-weight: 900;
}

/* slot */
#app {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.doors {
    display: flex;
}

.door {
    background: linear-gradient(180deg, rgba(43, 69, 113, 1) 0%, rgba(255, 255, 255, 1) 26%, rgba(255, 255, 255, 1) 70%, rgba(43, 69, 113, 1) 100%);
    width: 86px;
    height: 130px;
    overflow: hidden;
    border-radius: 6px;
    margin: 3px;
}

.boxes {
    transition: transform 1s ease-in-out;
}

.box {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 6rem;
    font-weight: 900;
}

.buttons {
    margin: 1rem 0 2rem 0;
}

button {
    cursor: pointer;
    font-size: 1.2rem;
    margin: 0 0.2rem;
    border: none;
    border-radius: 5px;
    padding: 10px 15px;
    font-weight: 700;
    background: #396dae;
    color: #fff;
}

.info {
    position: fixed;
    bottom: 0;
    width: 100%;
    text-align: center;
}
</style>