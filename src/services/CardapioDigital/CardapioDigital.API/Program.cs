using CardapioDigital.API.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();
builder.Services.AddSingleton<IDictionary<string, bool>>(opts => new Dictionary<string, bool>());
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy((builder =>
    {
        builder.WithOrigins("http://localhost:3000", "http://192.168.2.6:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    }));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.UseCors();

app.MapHub<PedidoHub>("/pedido");

app.Run();