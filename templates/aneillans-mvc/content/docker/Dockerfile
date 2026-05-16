FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["src/MvcHost/MvcHost.csproj", "src/MvcHost/"]
RUN dotnet restore "src/MvcHost/MvcHost.csproj"
COPY . .
RUN dotnet publish "src/MvcHost/MvcHost.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "MvcHost.dll"]
