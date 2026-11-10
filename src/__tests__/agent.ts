import * as v from 'valibot'

const ToolResult = v.object({
  content: v.tuple([v.object({ text: v.string(), type: v.literal('text') })]),
  isError: v.optional(v.boolean()),
})

/**
 * Stands in for a browser's `document.modelContext`, the way an agent sees
 * the page: the tools registered right now, and a way to call one. Call it
 * before the page renders.
 */
export function installAgent() {
  const tools = new Map<string, WebMCP.ModelContextTool>()

  const modelContext = {
    registerTool(
      tool: WebMCP.ModelContextTool,
      options?: WebMCP.ModelContextRegisterToolOptions,
    ) {
      tools.set(tool.name, tool)
      options?.signal?.addEventListener('abort', () => {
        if (tools.get(tool.name) === tool) {
          tools.delete(tool.name)
        }
      })

      return Promise.resolve()
    },
  }

  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    value: modelContext,
  })

  return {
    async call(name: string, input: Record<string, string | number | boolean>) {
      const tool = tools.get(name)

      if (!tool) {
        throw new Error(`No tool named ${name}.`)
      }

      const signal = new AbortController().signal
      const result = v.parse(ToolResult, await tool.execute(input, { signal }))

      return { error: result.isError ?? false, text: result.content[0].text }
    },
    inputs: (name: string) => tools.get(name)?.inputSchema,
    names: () => [...tools.keys()].toSorted(),
    uninstall: () => Reflect.deleteProperty(document, 'modelContext'),
  }
}
