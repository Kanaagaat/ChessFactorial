import json
from google import genai
from decouple import config as env_config
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.Games.models import Game

COACH_PROMPT = (
    "You are a chess coach. Analyse this PGN and return ONLY a JSON object (no markdown) "
    "with a 'mistakes' array of 3 objects, each with: move_number (int), label (short title), "
    "explanation (2 sentences max), better_move (algebraic notation)."
)

class AnalyzeGameView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        # 1. Database Check: Ensure the game belongs to the user
        game = Game.objects.filter(id=id, user=request.user).first()
        if not game:
            return Response({"detail": "Game not found."}, status=status.HTTP_404_NOT_FOUND)

        # 2. Cached Value: Return immediately if analysis exists
        if game.analysis:
            return Response(game.analysis)

        # 3. API Key Check
        api_key = env_config("GEMINI_API_KEY", default="")
        if not api_key:
            return Response({"detail": "GEMINI_API_KEY is not set."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            # 4. Trigger AI Analysis
            client = genai.Client(api_key=api_key)
            
            # Using Gemini 2.5 Flash for high-speed inference
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                config={
                    "system_instruction": COACH_PROMPT,
                    "response_mime_type": "application/json" # Forces JSON output structure
                },
                contents=f"PGN:\n{game.pgn}"
            )

            text_response = response.text.strip()
            
            # Sanitize response if the model includes markdown blocks
            if text_response.startswith("```"):
                text_response = text_response.strip("```json").strip("```").strip()

            # 5. Parse and Save
            parsed = json.loads(text_response)
            game.analysis = parsed
            game.save(update_fields=["analysis"])
            
            return Response(parsed)

        except json.JSONDecodeError:
            return Response(
                {"detail": "Coach response was not valid JSON.", "raw": text_response},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as e:
            return Response(
                {"detail": f"Gemini API error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )