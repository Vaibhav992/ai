import { NextResponse } from "next/server";
import { MobileCodeGen } from '@/configs/AiModel';
import Prompt from '@/data/Prompt';

export async function POST(req) {
    const { prompt, userAnswers } = await req.json();
    
    try {
        console.log('React Native code generation request:', { 
            prompt: prompt.substring(0, 100) + '...', 
            userAnswers 
        });
        
        // Create a specialized React Native prompt
        const reactNativePrompt = `
${prompt}

User Answers to Follow-up Questions:
${Object.entries(userAnswers || {}).map(([key, value]) => `Q${key}: ${value}`).join('\n')}

${Prompt.REACT_NATIVE_CODE_GEN_PROMPT}
        `;
        
        console.log('Generating React Native code with prompt length:', reactNativePrompt.length);
        const result = await MobileCodeGen.sendMessage(reactNativePrompt);
        
        const resp = result.response.text();
        console.log('React Native AI Response received, length:', resp.length);
        
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
                        throw new Error(`Failed to parse React Native AI response: ${thirdError.message}`);
                    }
                } else {
                    throw new Error('No valid JSON found in React Native AI response');
                }
            }
        }
        
        console.log('Successfully parsed React Native response keys:', Object.keys(parsedResponse));
        
        return NextResponse.json(parsedResponse);
        
    } catch (e) {
        console.error('React Native code generation error:', e);
        
        // If it's a JSON parsing error, provide a fallback response
        if (e.message && e.message.includes('JSON')) {
            console.log('Attempting to provide React Native fallback response...');
            return NextResponse.json({
                projectTitle: "React Native App",
                explanation: "Generated React Native app code (fallback response due to JSON parsing issues)",
                rnFiles: {
                    "App.tsx": {
                        "code": "import React from 'react';\nimport { NavigationContainer } from '@react-navigation/native';\nimport { createNativeStackNavigator } from '@react-navigation/native-stack';\nimport { Text, View, Button, StyleSheet } from 'react-native';\nimport { useResponsiveScreen } from 'react-native-responsive-screen';\n\nconst Stack = createNativeStackNavigator();\n\nfunction HomeScreen({ navigation }: { navigation: any }) {\n  const { hp, wp } = useResponsiveScreen();\n  return (\n    <View style={styles.container}>\n      <Text style={[styles.title, { fontSize: hp(3) }]}>Welcome to the App!</Text>\n      <Button\n        title=\"View Product\"\n        onPress={() => navigation.navigate('Product', { productId: '123' })}\n      />\n    </View>\n  );\n}\n\nfunction ProductScreen({ route }: { route: any }) {\n  const { productId } = route.params;\n  return (\n    <View style={styles.container}>\n      <Text style={styles.title}>Product Details</Text>\n      <Text style={styles.subtitle}>Product ID: {productId}</Text>\n      <Button\n        title=\"Back to Home\"\n        onPress={() => navigation.goBack()}\n      />\n    </View>\n  );\n}\n\nfunction App() {\n  return (\n    <NavigationContainer>\n      <Stack.Navigator initialRouteName=\"Home\">\n        <Stack.Screen name=\"Home\" component={HomeScreen} />\n        <Stack.Screen name=\"Product\" component={ProductScreen} />\n      </Stack.Navigator>\n    </NavigationContainer>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: 'center',\n    alignItems: 'center',\n    backgroundColor: '#F5FCFF',\n    padding: 20,\n  },\n  title: {\n    fontSize: 24,\n    fontWeight: 'bold',\n    marginBottom: 20,\n    textAlign: 'center',\n  },\n  subtitle: {\n    fontSize: 16,\n    marginBottom: 20,\n    textAlign: 'center',\n  },\n});\n\nexport default App;"
                    },
                    "package.json": {
                        "code": "{\n  \"name\": \"generated-react-native-app\",\n  \"version\": \"0.0.1\",\n  \"private\": true,\n  \"scripts\": {\n    \"android\": \"react-native run-android\",\n    \"ios\": \"react-native run-ios\",\n    \"start\": \"react-native start\",\n    \"test\": \"jest\",\n    \"lint\": \"eslint .\"\n  },\n  \"dependencies\": {\n    \"@react-navigation/native\": \"^6.1.9\",\n    \"@react-navigation/native-stack\": \"^6.9.17\",\n    \"react\": \"18.2.0\",\n    \"react-native\": \"0.73.0\",\n    \"react-native-reanimated\": \"~3.6.2\",\n    \"react-native-responsive-screen\": \"^1.4.2\"\n  },\n  \"devDependencies\": {\n    \"@babel/core\": \"^7.20.0\",\n    \"@babel/preset-env\": \"^7.20.0\",\n    \"@babel/runtime\": \"^7.20.0\",\n    \"@react-native/babel-preset\": \"^0.73.18\",\n    \"@react-native/eslint-config\": \"^0.73.1\",\n    \"@react-native/metro-config\": \"^0.73.2\",\n    \"@react-native/typescript-transformer\": \"^1.2.1\",\n    \"@types/jest\": \"^29.2.1\",\n    \"@types/react\": \"^18.0.24\",\n    \"@types/react-test-renderer\": \"^18.0.0\",\n    \"babel-jest\": \"^29.2.1\",\n    \"eslint\": \"^8.19.0\",\n    \"jest\": \"^29.2.1\",\n    \"metro-react-native-babel-preset\": \"^0.73.20\",\n    \"prettier\": \"^2.4.1\",\n    \"react-test-renderer\": \"18.2.0\",\n    \"typescript\": \"^5.1.3\"\n  },\n  \"engines\": {\n    \"node\": \">=18\"\n  }\n}"
                    }
                },
                rnGeneratedFiles: ["App.tsx", "package.json"]
            });
        }
        
        return NextResponse.json({
            error: e.message || "React Native code generation failed",
            details: e.stack
        }, { status: 500 });
    }
} 