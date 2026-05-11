import { MCPTool, MCPInput } from "mcp-framework";
import { z } from "zod";

const schema = z.object({
  message: z.string().describe("Message to process"),
});

class CompanyData extends MCPTool {
  name = "compnay_data";
  description = "Lets internal people access company data";
  schema = schema;

  async execute(input: MCPInput<this>) {
    return `Processed: ${input.message}`;
  }
}

export default CompanyData;