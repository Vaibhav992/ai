import { NextResponse } from "next/server";
import { MobileCodeGen } from '@/configs/AiModel';
import Prompt from '@/data/Prompt';

export async function POST(req) {
    const { prompt, userAnswers } = await req.json();
    
    try {
        console.log('Flutter code generation request:', { 
            prompt: prompt.substring(0, 100) + '...', 
            userAnswers 
        });
        
        // Create a specialized Flutter prompt
        const flutterPrompt = `
${prompt}

User Answers to Follow-up Questions:
${Object.entries(userAnswers || {}).map(([key, value]) => `Q${key}: ${value}`).join('\n')}

${Prompt.FLUTTER_CODE_GEN_PROMPT}
        `;
        
        console.log('Generating Flutter code with prompt length:', flutterPrompt.length);
        const result = await MobileCodeGen.sendMessage(flutterPrompt);
        
        const resp = result.response.text();
        console.log('Flutter AI Response received, length:', resp.length);
        
        // Clean and parse the JSON response
        let parsedResponse;
        try {
            // First, try to parse as-is
            parsedResponse = JSON.parse(resp);
        } catch (parseError) {
            console.log('Initial JSON parse failed, attempting to clean response...');
            
            // Try to extract JSON from markdown code blocks
            let cleanedResp = resp;
            
            // Remove markdown code blocks if present
            cleanedResp = cleanedResp.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
            
            // Fix common JSON escaping issues
            cleanedResp = cleanedResp
                .replace(/\\n/g, '\\n')  // Fix newlines
                .replace(/\\"/g, '"')    // Fix double quotes
                .replace(/\\\\/g, '\\')  // Fix backslashes
                .replace(/\n/g, '\\n')   // Convert actual newlines to escaped
                .replace(/\r/g, '\\r')   // Convert carriage returns
                .replace(/\t/g, '\\t');  // Convert tabs
            
            try {
                parsedResponse = JSON.parse(cleanedResp);
            } catch (secondError) {
                console.log('Cleaned JSON parse also failed, attempting manual extraction...');
                
                // Try to extract JSON using regex
                const jsonMatch = cleanedResp.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    try {
                        parsedResponse = JSON.parse(jsonMatch[0]);
                    } catch (thirdError) {
                        console.error('All JSON parsing attempts failed');
                        throw new Error(`Failed to parse Flutter AI response: ${thirdError.message}`);
                    }
                } else {
                    throw new Error('No valid JSON found in Flutter AI response');
                }
            }
        }
        
        console.log('Successfully parsed Flutter response keys:', Object.keys(parsedResponse));
        
        return NextResponse.json(parsedResponse);
        
    } catch (e) {
        console.error('Flutter code generation error:', e);
        
        // If it's a JSON parsing error, provide a fallback response
        if (e.message && e.message.includes('JSON')) {
            console.log('Attempting to provide Flutter fallback response...');
            return NextResponse.json({
                projectTitle: "Flutter App",
                explanation: "Generated Flutter app code (fallback response due to JSON parsing issues)",
                flutterFiles: {
                    "lib/main.dart": {
                        "code": "import 'package:flutter/material.dart';\nimport 'package:go_router/go_router.dart';\nimport 'package:provider/provider.dart';\n\nvoid main() {\n  runApp(MyApp());\n}\n\nfinal _router = GoRouter(\n  routes: [\n    GoRoute(\n      path: '/',\n      builder: (context, state) => HomeScreen(),\n    ),\n    GoRoute(\n      path: '/product/:id',\n      builder: (context, state) {\n        final productId = state.pathParameters['id'];\n        return ProductScreen(productId: productId ?? 'default_id');\n      },\n    ),\n  ],\n);\n\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp.router(\n      routerConfig: _router,\n      title: 'Generated Flutter App',\n      theme: ThemeData(\n        primarySwatch: Colors.blue,\n        useMaterial3: true,\n      ),\n    );\n  }\n}\n\nclass HomeScreen extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(\n        title: const Text('Home'),\n      ),\n      body: Center(\n        child: Column(\n          mainAxisAlignment: MainAxisAlignment.center,\n          children: <Widget>[\n            const Text(\n              'Welcome to the App!',\n              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),\n            ),\n            const SizedBox(height: 20),\n            ElevatedButton(\n              onPressed: () => GoRouter.of(context).go('/product/123'),\n              child: const Text('View Product'),\n            ),\n          ],\n        ),\n      ),\n    );\n  }\n}\n\nclass ProductScreen extends StatelessWidget {\n  final String productId;\n\n  const ProductScreen({Key? key, required this.productId}) : super(key: key);\n\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(\n        title: Text('Product ID: $productId'),\n      ),\n      body: Center(\n        child: Column(\n          mainAxisAlignment: MainAxisAlignment.center,\n          children: <Widget>[\n            Text(\n              'Product Details',\n              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),\n            ),\n            const SizedBox(height: 10),\n            Text('Product ID: $productId'),\n            const SizedBox(height: 20),\n            ElevatedButton(\n              onPressed: () => GoRouter.of(context).go('/'),\n              child: const Text('Back to Home'),\n            ),\n          ],\n        ),\n      ),\n    );\n  }\n}"
                    },
                    "pubspec.yaml": {
                        "code": "name: generated_flutter_app\ndescription: A generated Flutter app\n\npublish_to: 'none'\n\nversion: 1.0.0+1\n\nenvironment:\n  sdk: '>=3.0.0 <4.0.0'\n\ndependencies:\n  flutter:\n    sdk: flutter\n  go_router: ^12.0.0\n  provider: ^6.0.0\n  cupertino_icons: ^1.0.2\n\ndev_dependencies:\n  flutter_test:\n    sdk: flutter\n  flutter_lints: ^2.0.0\n\nflutter:\n  uses-material-design: true"
                    }
                },
                flutterGeneratedFiles: ["lib/main.dart", "pubspec.yaml"]
            });
        }
        
        return NextResponse.json({
            error: e.message || "Flutter code generation failed",
            details: e.stack
        }, { status: 500 });
    }
} 