"""
Wikipedia Context Tool

Fetches definitions and summaries from Wikipedia for concepts
not fully covered in uploaded course materials.
"""

import wikipedia
from wikipedia.exceptions import DisambiguationError, PageError


def get_wiki_context(topic: str) -> str:
    """
    Fetch a Wikipedia summary for a given topic.

    Args:
        topic: The topic to search for on Wikipedia.

    Returns:
        A summary string (up to 3 sentences) or an error message
        if the topic cannot be found.
    """
    # Set language to English
    wikipedia.set_lang("en")

    try:
        # Get summary with 3 sentences max
        summary = wikipedia.summary(topic, sentences=3)
        return summary

    except DisambiguationError as e:
        # Topic is ambiguous, try the first option
        if e.options:
            try:
                first_option = e.options[0]
                summary = wikipedia.summary(first_option, sentences=3)
                return summary
            except Exception:
                return "No external context found."
        return "No external context found."

    except PageError:
        # Page doesn't exist
        return "No external context found."

    except Exception:
        # Handle any other exceptions gracefully
        return "No external context found."
