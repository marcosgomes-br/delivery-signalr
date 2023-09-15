using Microsoft.AspNetCore.SignalR;

namespace CardapioDigital.API.Hubs;

public class PedidoHub : Hub
{
    private readonly IDictionary<string, bool> _statusLoja;
    public PedidoHub(IDictionary<string, bool> statusLoja)
    {
        _statusLoja = statusLoja;
    }
    public async Task EfetuarPedido(Pedido pedido)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, pedido.Id.ToString());
        await Clients.All.SendAsync("ReceiveMessage", pedido);
    }

    public async Task Login(string usuario, string grupoUsuario)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, grupoUsuario);
        await Clients.Group("operadorEmpilhadeira").SendAsync()
    }

    public async Task FinalizarPedido(int id)
    {
        await Clients.Client(Context.ConnectionId).SendAsync("PedidoPronto");
    }

    public async Task StatusLoja()
    {
        var aberta = _statusLoja.Values.Where(x => x).Any();
        await Clients.All.SendAsync("StatusLoja", aberta);
    }
}