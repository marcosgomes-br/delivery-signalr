import React, { useState } from 'react';
import './App.css';
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";

const ClientePage: React.FC = () => {
  const produtos = [
    {id: 1, nome: 'Brigadeiro', preco: 3.70, img: "https://i.panelinha.com.br/i1/228-q-2859-brigadeiro.webp"},
    {id: 2, nome: 'Torta de Limão', preco: 5.90, img: "https://www.oetker.com.br/Recipe/Recipes/oetker.com.br/br-pt/baking/image-thumb__228596__RecipeDetailsLightBox/torta-de-limao.jpg"},
    {id: 3, nome: 'Bolo do Pote', preco: 10.90, img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiqS4EbhiRWPpik9K0oT7EvL1Z0qlbRMAzk2Rq9ydGTsM1ze_kgBXk3Go7sqb5O2g0AEsjx8o4VDSkhFN7jkn42khiNErDSlsnt-IC-LmHhqplB8hTWYXD3rOmf4fT1Qs6_5K4LnCg69pVtUgIL0YLdfFowLQcCDrZx9nVlNl9Iws2khcKY1BF5Zv_P/s1500/bolo-de-pote-0.jpg"},
  ]
  const [pedido, setPedido] = useState<any>({itens: []});
  return <>
    <form onSubmit={async (e) => {
      e.preventDefault();
      try {
        const conexao = new HubConnectionBuilder()
          .withUrl("http://localhost:5237/pedido")
          .configureLogging(LogLevel.Information)
          .build();

          conexao.on("PedidoPronto", () => {
            alert('seu pedido ficou pronto');
          });

          await conexao.start();
          await conexao.invoke("EfetuarPedido", pedido);
          alert('Pedido Efetuado com sucesso');
      } catch (e) {
        console.log(e);
      }
    }}>
      <div>
        <input 
          type="text" 
          placeholder="Nome" 
          value={pedido.cliente}
          onChange={(e) => {
            setPedido({...pedido, cliente: e.target.value})
          }} 
        />
        <input 
          type="tel" 
          placeholder="Telefone" 
          value={pedido.telefone} 
          onChange={(e) => {
            setPedido({...pedido, telefone: e.target.value})
          }} 
        />
      </div>
      <h1>Produtos:</h1>
      {produtos.map(x => {
        return (
          <div key={x.id} style={{borderBottom: '.1rem solid #BBB', padding: '.7rem .3rem'}}>
            <div style={{display: 'flex', float: 'left'}}>
              <img src={x.img} height="100px" width="100px" style={{borderRadius: '100rem', boxShadow: '.2rem .2rem 1rem #BCBCBC'}} />        
            </div>
            <div style={{textAlign: 'center'}}>
              <p style={{margin: '0', padding: '0', fontSize: '1.3rem'}}>{x.nome}</p>
              <p>R$ {x.preco.toFixed(2).replace('.', ',')}</p>
              {pedido.itens.some((p: any) => p.id === x.id) && <input type='number' style={{width: '117px', marginTop: '12px'}} value={pedido.itens.find((f: any) => f.id === x.id).quantidade || 1} onChange={(e) => {
                setPedido({...pedido, itens: [...pedido.itens.filter((f: any) => f.id !== x.id), {...x, quantidade: e.target.valueAsNumber}]})
              }} />}
              {!pedido.itens.some((p: any) => p.id === x.id) ?
              <button type="button" style={{float: 'right'}} onClick={() => {setPedido({...pedido, itens: [...pedido.itens, {...x, quantidade: 1}]})}}>Adicionar à Sacola</button> : 
              <button type="button" style={{float: 'right'}} onClick={() => {setPedido({...pedido, itens: [...pedido.itens.filter((f: any) => f.id !== x.id)]})}}>Remover Item</button>}
            </div>
            <div style={{clear: 'both'}}></div>
          </div>
        )
      })}
      <button type="submit" disabled={!pedido.itens.length} style={{width: '100%', marginBottom: '.5rem'}}>Efetuar Pedido</button>
    </form>
  </>
}

const RestaurantePage: React.FC = () => {
  const [pedidos, setPedidos] = useState<any[]>([]);  
  const [conn, setConn] = useState<HubConnection>();

  const iniciarConexao = async () => {
    const conexao = new HubConnectionBuilder()
    .withUrl("http://localhost:5237/pedido")
    .configureLogging(LogLevel.Information)
    .build();

    conexao.on("ReceiveMessage", (pedido) => {
      setPedidos(pedidos => [...pedidos, pedido]);
    });
    await conexao.start();
    setConn(conexao);
  }
  return (
    <>
      <button hidden={!!conn} onClick={() => {
        iniciarConexao();
      }}>Abrir Loja</button>
      <h2 style={{textAlign: 'center'}}>{pedidos.length ? `Você tem ${pedidos.length} Pedidos:`: 'Sem pedidos abertos no momento'}</h2>
      {pedidos.map(x => {
        return (
          <div style={{borderBottom: '1px solid #333', padding: '10px 0'}}>
            <h3>Nº Pedido: {x.id}</h3>
            <p style={{margin: '0', padding: '0'}}><b>Cliente:</b> {x.cliente}</p>
            <p style={{margin: '0', padding: '0'}}><b>Contato:</b> {x.telefone}</p>
            <p style={{margin: '0', padding: '0'}}><b>Total:</b> R${x.total.toFixed(2).replace('.',',')}</p>
            <h4>Itens:</h4>
            <ul>
              {x.itens.map((y: any) => {
                return (<li>{y.quantidade}x - {y.nome}</li>)
              })}
            </ul>
            <button disabled={!conn} onClick={() => {
              try {
                if(conn){
                  conn.invoke("finalizarPedido", x.id);
                  setPedidos(pedidos => pedidos.filter(p => p.id !== x.id))
                }
              } catch (error) {
                console.log(error);
              }
            }}>Finalizar Pedido</button>
          </div>
        )
      })}
    </>
  )
}

function App() {
  const [tipoUsuario, setTipoUsuario] = useState<'cliente' | 'restaurante'>('cliente');
  return (
    <div className="App">
      <input type='checkbox' onChange={(e) => !e.target.checked ? setTipoUsuario('cliente') : setTipoUsuario('restaurante')} />
      <br />
      {tipoUsuario === 'cliente' ? <ClientePage /> : <RestaurantePage />}
    </div>
  );
}

export default App;
