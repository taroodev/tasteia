import {McpServer} from "@modelcontextprotocol/sdk/server/mcp.js"
import {z } from "zod"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// 1 creamos el servidor
const server = new McpServer({
    name :"MyServer",
    version: "1.0.0",
 
});
// creamos herramientas parae que el llm atraves de mi servidor pueda realizar acciones
server.tool(
    'fech-whether',
    'this is  adescription of the tool',
    {
        city: z.string().describe("the city to fetch the whether")
    },
    async ({city}) => {
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`);
        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return {
                content: [
                    { type: "text", 
                      text: `not found the weather for the ${city}` }
                ]
            };
        }

        const { latitude, longitude } = data.results[0];
        const weatherResponse = await fetch(`https://historical-forecast-api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start_date=2025-04-14&end_date=2025-04-28&hourly=temperature_2m`);
        const weatherData = await weatherResponse.json();
        
        return {
                content:[
                    { type: "text", 
                      text: JSON.stringify(weatherData, null, 2) }
                ]
            }
        
    }
 
)
const transport = new StdioServerTransport()
await server.connect(transport)

