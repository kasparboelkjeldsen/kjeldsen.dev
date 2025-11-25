import { getQuery, setCookie } from 'h3'
import type { H3Event } from 'h3'

export interface EngageRuleCondition {
  type: string
  input: string[]
}

export interface EngagePageRules {
  personalizationId: number
  parameters: {
    campaign?: EngageRuleCondition
    [key: string]: EngageRuleCondition | undefined
  }
  settings: {
    range: {
      type: string
      maximum: number | null
    }
  }
}

export const SetForcedSegmentFromRules = (rules: EngagePageRules, event: H3Event) => {
  const query = getQuery(event)

  // Match up utm_* parameters from request to rules conditions
  for (const [key, condition] of Object.entries(rules.parameters)) {
    if (!condition) continue

    // Map 'campaign' -> 'utm_campaign', 'medium' -> 'utm_medium', etc.
    const paramName = `utm_${key}`
    const paramValue = query[paramName]

    if (!paramValue) continue

    const valueToCheck = Array.isArray(paramValue) ? paramValue[0] : paramValue

    if (condition.type === 'contains') {
      // Check if the parameter value contains any of the input strings
      const match = condition.input.some((inputStr) =>
        valueToCheck.toLowerCase().includes(inputStr.toLowerCase())
      )

      if (match) {
        // Construct the segment alias based on the personalizationId
        const segmentAlias = `engage_personalization_${rules.personalizationId}`

        // Set the cookie to force this segment
        setCookie(event, 'manual-segment', segmentAlias)

        // Also set a header so we can read it immediately in the same request lifecycle
        event.node.req.headers['manual-segment'] = segmentAlias

        console.log(
          `Engage Rule Match: ${paramName}="${valueToCheck}" matched rule. Setting segment to '${segmentAlias}'.`
        )
        return // Stop after first match
      }
    }
  }
}
