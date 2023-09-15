namespace CardapioDigital.API;

public class Pedido
{
    public int Id { get; set; } = new Random().Next(); 
    public string Cliente { get; set; }
    public string Telefone { get; set; }
    public decimal Total
    {
        get { return this.Itens.Sum(s => s.Preco * s.Quantidade); }
    }
    public List<Item> Itens { get; set; }
}

public class Item
{
    public string Nome { get; set; }
    public decimal Preco { get; set; }
    public int Quantidade { get; set; }
}