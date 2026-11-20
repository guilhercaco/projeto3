
const botao = document.getElementById("botao");
const campoCep = document.getElementById("cep");

const municipiosRMC = [
    "Curitiba",
    "Adrianópolis",
    "Agudos do Sul",
    "Almirante Tamandaré",
    "Araucária",
    "Balsa Nova",
    "Bocaiúva do Sul",
    "Campina Grande do Sul",
    "Campo do Tenente",
    "Campo Largo",
    "Campo Magro",
    "Cerro Azul",
    "Colombo",
    "Contenda",
    "Doutor Ulysses",
    "Fazenda Rio Grande",
    "Itaperuçu",
    "Lapa",
    "Mandirituba",
    "Piên",
    "Pinhais",
    "Piraquara",
    "Quatro Barras",
    "Rio Branco do Sul",
    "Rio Negro",
    "São José dos Pinhais",
    "Quitandinha",
    "Tijucas do Sul",
    "Tunas do Paraná"
];

function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

campoCep.addEventListener("input", () => {
    let numeros = campoCep.value.replace(/\D/g, "").slice(0, 8);

    if (numeros.length > 5) {
        campoCep.value =
            numeros.slice(0, 5) + "-" + numeros.slice(5);
    } else {
        campoCep.value = numeros;
    }
});

botao.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const nome = document.getElementById("nome").value;

    const cepLimpo = campoCep.value.replace(/\D/g, "");

    if (!/^\d{8}$/.test(cepLimpo)) {
        alert("CEP inválido! Digite os 8 números.");
        campoCep.focus();
        return;
    }

    try {

        const consulta = await fetch(
            `https://viacep.com.br/ws/${cepLimpo}/json/`
        );

        if (!consulta.ok) {
            throw new Error("Não foi possível consultar o CEP.");
        }

        const endereco = await consulta.json();

        if (endereco.erro) {
            alert("CEP não encontrado!");
            campoCep.focus();
            return;
        }

        const cidadePermitida = municipiosRMC.some(
            cidade => normalizar(cidade) === normalizar(endereco.localidade)
        );

        if (endereco.uf !== "PR" || !cidadePermitida) {
            alert(
                "Não atendemos essa região! Informe um CEP da Região Metropolitana de Curitiba."
            );
            campoCep.focus();
            return;
        }

        const resposta = await fetch("http://localhost:3000/cadastrar", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                senha: senha,
                nome: nome,
                cep: cepLimpo
            })
        });

        const resultado = await resposta.json();

        if (resposta.ok) {

            alert("Conta criada com sucesso!");
            window.location.href = "index.html";

        } else {

            alert(resultado.mensagem);

        }

    } catch (erro) {

        console.error("ERRO:", erro);

        alert("Não foi possível consultar o CEP ou conectar ao servidor. Tente novamente.");

    }

});
