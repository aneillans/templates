FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/DemoMvc/DemoMvc.csproj", "src/DemoMvc/"]
RUN dotnet restore "src/DemoMvc/DemoMvc.csproj"
COPY . .
RUN dotnet publish "src/DemoMvc/DemoMvc.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "DemoMvc.dll"]
