const formEndereco = document.getElementById("formEndereco");
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
    "Quitandinha",
    "Rio Branco do Sul",
    "Rio Negro",
    "São José dos Pinhais",
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

formEndereco.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id_cliente = localStorage.getItem("id_cliente");

    if (!id_cliente) {
        alert("Faça login antes de cadastrar seu endereço.");
        window.location.href = "../html/conta.html";
        return;
    }

    const cep = campoCep.value.trim();
    const cepLimpo = cep.replace(/\D/g, "");

    const rua = document.getElementById("rua").value.trim();

    const complemento = document
        .getElementById("complemento")
        .value.trim();

    if (!/^\d{8}$/.test(cepLimpo)) {
        alert("CEP inválido! Digite os 8 números.");
        campoCep.focus();
        return;
    }

    if (!rua) {
        alert("Preencha a rua.");
        return;
    }

    try {
        const consulta = await fetch(
            `https://viacep.com.br/ws/${cepLimpo}/json/`
        );

        if (!consulta.ok) {
            throw new Error("Erro ao consultar o CEP.");
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

        const resposta = await fetch("http://localhost:3000/endereco", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                id_cliente,
                cep: cepLimpo,
                rua,
                complemento
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.mensagem || "Erro ao salvar o endereço.");
            return;
        }


        alert("Endereço salvo com sucesso!");
        
        window.location.href = "index.html";

    } catch (erro) {
        console.error("Erro:", erro);

        alert(
            "Não foi possível consultar o CEP ou conectar ao servidor."
        );
    }
});
