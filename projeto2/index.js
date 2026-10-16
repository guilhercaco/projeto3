
import "dotenv/config";
import express from "express";
import cors from "cors";
import { neon } from "@neondatabase/serverless";

const app = express();
const sql = neon(process.env.DATABASE_URL);

app.use(cors());
app.use(express.json());


// CADASTRAR CLIENTE


app.post("/cadastrar", async (req, res) => {
    try {
        const { email, senha, nome, cep } = req.body;

        console.log("CADASTRO:", email, nome, cep);

        await sql`
            INSERT INTO cliente (email, senha, nome, cep)
            VALUES (${email}, ${senha}, ${nome}, ${cep})
        `;

        res.json({
            mensagem: "Cliente cadastrado com sucesso!"
        });

    } catch (erro) {
        console.error("ERRO NO CADASTRO:", erro);

        res.status(500).json({
            mensagem: "Erro ao cadastrar cliente."
        });
    }
});


// LOGIN


app.post("/login", async (req, res) => {
    try {
        const { email, senha } = req.body;

        const cliente = await sql`
            SELECT id, nome, email
            FROM cliente
            WHERE email = ${email}
              AND senha = ${senha}
        `;

        if (cliente.length > 0) {
            res.json({
                existe: true,
                id_cliente: cliente[0].id,
                nome: cliente[0].nome
            });
        } else {
            res.json({ existe: false });
        }

    } catch (erro) {
        console.error("ERRO NO LOGIN:", erro);

        res.status(500).json({
            mensagem: "Erro ao verificar a conta."
        });
    }
});

// CADASTRAR / ATUALIZAR ENDEREÇO

app.post("/endereco", async (req, res) => {
    try {
        const { id_cliente, cep, rua, complemento } = req.body;

        const id = Number(id_cliente);
        const cepLimpo = String(cep || "").replace(/\D/g, "");
        const ruaLimpa = String(rua || "").trim();
        const complementoLimpo = String(complemento || "").trim();

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensagem: "Cliente inválido. Faça login novamente."
            });
        }

        if (cepLimpo.length !== 8 || !ruaLimpa) {
            return res.status(400).json({
                mensagem: "Informe um CEP válido e a rua."
            });
        }

        if (ruaLimpa.length > 150 ||
            complementoLimpo.length > 150) {
            return res.status(400).json({
                mensagem: "Rua ou complemento muito longo."
            });
        }

        const cliente = await sql`
            SELECT id
            FROM cliente
            WHERE id = ${id}
        `;

        if (cliente.length === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado."
            });
        }

        await sql.transaction([
            sql`
                UPDATE cliente
                SET cep = ${cepLimpo},
                    rua = ${ruaLimpa},
                    complemento = ${complementoLimpo}
                WHERE id = ${id}
            `,
            sql`
                INSERT INTO cep (
                    id_cliente,
                    cep,
                    rua,
                    complemeto
                )
                VALUES (
                    ${id},
                    ${cepLimpo},
                    ${ruaLimpa},
                    ${complementoLimpo}
                )
                ON CONFLICT (id_cliente)
                WHERE id_cliente IS NOT NULL
                DO UPDATE SET
                    cep = EXCLUDED.cep,
                    rua = EXCLUDED.rua,
                    complemeto = EXCLUDED.complemeto
            `
        ]);

        res.json({
            sucesso: true,
            mensagem: "Endereço atualizado nas duas tabelas!"
            
        });

    } catch (erro) {
        console.error("ERRO AO ATUALIZAR ENDEREÇO:", erro);

        res.status(500).json({
            mensagem: "Erro ao atualizar o endereço."
        });
    }
});

app.get("/cliente/:id/cep", async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                erro: "ID do cliente inválido."
            });
        }

        const resultado = await sql`
            SELECT
                c.id,
                COALESCE(e.cep, c.cep) AS cep
            FROM cliente c
            LEFT JOIN cep e ON e.id_cliente = c.id
            WHERE c.id = ${id}
        `;

        if (resultado.length === 0) {
            return res.status(404).json({
                erro: "Cliente não encontrado."
            });
        }

        res.json(resultado[0]);

    } catch (erro) {
        console.error("Erro ao buscar CEP:", erro);

        res.status(500).json({
            erro: "Erro ao consultar o CEP."
        });
    }
});


// ADICIONAR PRODUTO

app.post("/carrinho", async (req, res) => {
    try {
        const clienteId = Number(req.body.cliente_id);
        const produtoId = Number(req.body.produto_id);

        if (
            !Number.isInteger(clienteId) || clienteId <= 0 ||
            !Number.isInteger(produtoId) || produtoId <= 0
        ) {
            return res.status(400).json({
                mensagem: "Cliente ou produto inválido."
            });
        }

        const cliente = await sql`
            SELECT id
            FROM cliente
            WHERE id = ${clienteId}
        `;

        if (cliente.length === 0) {
            return res.status(404).json({
                mensagem: "Cliente não encontrado. Faça login novamente."
            });
        }

        
        const enderecos = await sql`
            SELECT id
            FROM cep
            WHERE id_cliente = ${clienteId}
            LIMIT 1
        `;

        if (enderecos.length === 0) {
            return res.status(400).json({
                mensagem: "Cadastre seu endereço antes de adicionar produtos."
            });
        }

    
        const produtos = await sql`
            SELECT id, nome, estoque
            FROM produto
            WHERE id = ${produtoId}
        `;

        if (produtos.length === 0) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        if (produtos[0].estoque <= 0) {
            return res.status(400).json({
                mensagem: "Este produto está sem estoque."
            });
        }

    
        await sql`
            INSERT INTO compra (cliente_id, cep_id, produto_id)
            VALUES (
                ${clienteId},
                ${enderecos[0].id},
                ${String(produtoId)}
            )
        `;

        res.status(201).json({
            sucesso: true,
            mensagem: `${produtos[0].nome} foi adicionado ao carrinho!`
        });

    } catch (erro) {
        console.error("ERRO AO ADICIONAR AO CARRINHO:", erro);

        res.status(500).json({
            mensagem: "Não foi possível adicionar o produto ao carrinho."
        });
    }
});

app.get("/carrinho/:clienteId", async (req, res) => {
    try {
        const clienteId = Number(req.params.clienteId);

        if (!Number.isInteger(clienteId) || clienteId <= 0) {
            return res.status(400).json({
                mensagem: "ID do cliente inválido."
            });
        }

        const itens = await sql`
            SELECT
                compra.id AS compra_id,
                produto.id AS produto_id,
                produto.nome,
                produto.valor,
                produto.imagem
            FROM compra
            INNER JOIN produto
                ON produto.id::TEXT = compra.produto_id
            WHERE compra.cliente_id = ${clienteId}
            ORDER BY compra.id DESC
        `;

        res.json(itens);

    } catch (erro) {
        console.error("ERRO AO CONSULTAR CARRINHO:", erro);

        res.status(500).json({
            mensagem: "Erro ao consultar o carrinho."
        });
    }
});

//PESQUISA 


app.get("/produtos", async (req, res) => {
    try {
        const pesquisa = String(req.query.pesquisa || "").trim();

        if (!pesquisa) {
            return res.json([]);
        }

        const produtos = await sql`
            SELECT id, nome, valor, imagem, pagina
            FROM produto
            WHERE nome ILIKE ${"%" + pesquisa + "%"}
            ORDER BY nome
            LIMIT 20
        `;

        res.json(produtos);

    } catch (erro) {
        console.error("Erro na pesquisa:", erro);

        res.status(500).json({
            erro: "Erro ao pesquisar produtos."
        });
    }
});

//deletar compra 

app.delete("/carrinho/:compraId", async (req, res) => {
    try {
        const compraId = Number(req.params.compraId);
        const clienteId = Number(req.body.cliente_id);
        if (
            !Number.isInteger(compraId) || compraId <= 0 ||
            !Number.isInteger(clienteId) || clienteId <= 0
        ) {
            return res.status(400).json({
                mensagem: "Dados inválidos."
            });
        }
        const resultado = await sql`
            DELETE FROM compra
            WHERE id = ${compraId}
              AND cliente_id = ${clienteId}
            RETURNING id
        `;
        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: "Produto não encontrado na compra do cliente."
            });
        }
        return res.json({
            sucesso: true,
            mensagem: "Produto excluído da compra com sucesso!"
        });
    } catch (erro) {
        console.error("Erro ao excluir produto:", erro);

        return res.status(500).json({
            mensagem: "Erro ao excluir o produto da compra."
        });
    }
});


app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
