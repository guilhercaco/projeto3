const produtos = [
    {
        imagem:"../imagem/Cif_Limpeza.png",
        pagina:"produtos.html"
    },
    {
        imagem:"../imagem/Antena_4K.png",
        pagina:"produtos1.html"
    },
    {
        imagem:"../imagem/Oferta_Fones.png",
        pagina:"produtos2.html"
    },
    {
        imagem:"../imagem/Banner_Fitness.png",
        pagina:"produtos3.html"
    }
];

let indiceAtual = 0;

function mostrarImagem() {
    document.getElementById("imagemPropaganda").src =
        produtos[indiceAtual].imagem;

    document.getElementById("linkPropaganda").href =
        produtos[indiceAtual].pagina;
}

function proximaImagem() {
    indiceAtual = (indiceAtual + 1) % produtos.length;
    mostrarImagem();
}

function imagemAnterior() {
    indiceAtual =
        (indiceAtual - 1 + produtos.length) % produtos.length;
    mostrarImagem();
}

mostrarImagem();