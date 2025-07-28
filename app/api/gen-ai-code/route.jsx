import { NextResponse } from "next/server";
import { GenAiCode, MobileCodeGen } from '@/configs/AiModel';
import Prompt from '@/data/Prompt';

export async function POST(req){
    const {prompt, includeMobile = false} = await req.json();
    try{
        console.log('Code generation request:', { prompt: prompt.substring(0, 100) + '...', includeMobile });
        
        let result;
        
        if (includeMobile) {
            // Generate both web and mobile code
            const mobilePrompt = prompt + "\n\n" + Prompt.MOBILE_CODE_GEN_PROMPT;
            console.log('Generating mobile code with prompt length:', mobilePrompt.length);
            result = await MobileCodeGen.sendMessage(mobilePrompt);
        } else {
            // Generate only web code
            const webPrompt = prompt + "\n\n" + Prompt.CODE_GEN_PROMPT;
            console.log('Generating web code with prompt length:', webPrompt.length);
            result = await GenAiCode.sendMessage(webPrompt);
        }
        
        const resp = result.response.text();
        console.log('AI Response received, length:', resp.length);
        
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
                        throw new Error(`Failed to parse AI response: ${thirdError.message}`);
                    }
                } else {
                    throw new Error('No valid JSON found in AI response');
                }
            }
        }
        
        console.log('Successfully parsed response keys:', Object.keys(parsedResponse));
        
        return NextResponse.json(parsedResponse);
    }catch(e){
        console.error('Code generation error:', e);
        
        // If it's a JSON parsing error, try to provide a fallback response
        if (e.message && e.message.includes('JSON')) {
            console.log('Attempting to provide fallback response...');
            
            if (includeMobile) {
                return NextResponse.json({
                    projectTitle: "Mobile App Project",
                    explanation: "Generated mobile app code (fallback response due to JSON parsing issues)",
                    flutterFiles: {
                        "lib/main.dart": {
                            "code": "import 'package:flutter/material.dart';\nimport 'package:go_router/go_router.dart';\nimport 'package:provider/provider.dart';\n\nvoid main() {\n  runApp(MyApp());\n}\n\nfinal _router = GoRouter(\n  routes: [\n    GoRoute(\n      path: '/',\n      builder: (context, state) => HomeScreen(),\n    ),\n    GoRoute(\n      path: '/product/:id',\n      builder: (context, state) {\n        final productId = state.pathParameters['id'];\n        return ProductScreen(productId: productId ?? 'default_id');\n      },\n    ),\n  ],\n);\n\nclass MyApp extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return MaterialApp.router(\n      routerConfig: _router,\n      title: 'Generated App',\n      theme: ThemeData(\n        primarySwatch: Colors.blue,\n        useMaterial3: true,\n      ),\n    );\n  }\n}\n\nclass HomeScreen extends StatelessWidget {\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(\n        title: const Text('Home'),\n      ),\n      body: Center(\n        child: Column(\n          mainAxisAlignment: MainAxisAlignment.center,\n          children: <Widget>[\n            const Text(\n              'Welcome to the App!',\n              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),\n            ),\n            const SizedBox(height: 20),\n            ElevatedButton(\n              onPressed: () => GoRouter.of(context).go('/product/123'),\n              child: const Text('View Product'),\n            ),\n          ],\n        ),\n      ),\n    );\n  }\n}\n\nclass ProductScreen extends StatelessWidget {\n  final String productId;\n\n  const ProductScreen({Key? key, required this.productId}) : super(key: key);\n\n  @override\n  Widget build(BuildContext context) {\n    return Scaffold(\n      appBar: AppBar(\n        title: Text('Product ID: $productId'),\n      ),\n      body: Center(\n        child: Column(\n          mainAxisAlignment: MainAxisAlignment.center,\n          children: <Widget>[\n            Text(\n              'Product Details',\n              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),\n            ),\n            const SizedBox(height: 10),\n            Text('Product ID: $productId'),\n            const SizedBox(height: 20),\n            ElevatedButton(\n              onPressed: () => GoRouter.of(context).go('/'),\n              child: const Text('Back to Home'),\n            ),\n          ],\n        ),\n      ),\n    );\n  }\n}"
                        },
                        "pubspec.yaml": {
                            "code": "name: generated_app\ndescription: A generated Flutter app\n\npublish_to: 'none'\n\nversion: 1.0.0+1\n\nenvironment:\n  sdk: '>=3.0.0 <4.0.0'\n\ndependencies:\n  flutter:\n    sdk: flutter\n  go_router: ^12.0.0\n  provider: ^6.0.0\n  cupertino_icons: ^1.0.2\n\ndev_dependencies:\n  flutter_test:\n    sdk: flutter\n  flutter_lints: ^2.0.0\n\nflutter:\n  uses-material-design: true"
                        }
                    },
                    rnFiles: {
                        "App.tsx": {
                            "code": "import React from 'react';\nimport { NavigationContainer } from '@react-navigation/native';\nimport { createNativeStackNavigator } from '@react-navigation/native-stack';\nimport { Text, View, Button, StyleSheet } from 'react-native';\nimport { useResponsiveScreen } from 'react-native-responsive-screen';\n\nconst Stack = createNativeStackNavigator();\n\nfunction HomeScreen({ navigation }: { navigation: any }) {\n  const { hp, wp } = useResponsiveScreen();\n  return (\n    <View style={styles.container}>\n      <Text style={[styles.title, { fontSize: hp(3) }]}>Welcome to the App!</Text>\n      <Button\n        title=\"View Product\"\n        onPress={() => navigation.navigate('Product', { productId: '123' })}\n      />\n    </View>\n  );\n}\n\nfunction ProductScreen({ route }: { route: any }) {\n  const { productId } = route.params;\n  return (\n    <View style={styles.container}>\n      <Text style={styles.title}>Product Details</Text>\n      <Text style={styles.subtitle}>Product ID: {productId}</Text>\n      <Button\n        title=\"Back to Home\"\n        onPress={() => navigation.goBack()}\n      />\n    </View>\n  );\n}\n\nfunction App() {\n  return (\n    <NavigationContainer>\n      <Stack.Navigator initialRouteName=\"Home\">\n        <Stack.Screen name=\"Home\" component={HomeScreen} />\n        <Stack.Screen name=\"Product\" component={ProductScreen} />\n      </Stack.Navigator>\n    </NavigationContainer>\n  );\n}\n\nconst styles = StyleSheet.create({\n  container: {\n    flex: 1,\n    justifyContent: 'center',\n    alignItems: 'center',\n    backgroundColor: '#F5FCFF',\n    padding: 20,\n  },\n  title: {\n    fontSize: 24,\n    fontWeight: 'bold',\n    marginBottom: 20,\n    textAlign: 'center',\n  },\n  subtitle: {\n    fontSize: 16,\n    marginBottom: 20,\n    textAlign: 'center',\n  },\n});\n\nexport default App;"
                        },
                        "package.json": {
                            "code": "{\n  \"name\": \"generated-app\",\n  \"version\": \"0.0.1\",\n  \"private\": true,\n  \"scripts\": {\n    \"android\": \"react-native run-android\",\n    \"ios\": \"react-native run-ios\",\n    \"start\": \"react-native start\",\n    \"test\": \"jest\",\n    \"lint\": \"eslint .\"\n  },\n  \"dependencies\": {\n    \"@react-navigation/native\": \"^6.1.9\",\n    \"@react-navigation/native-stack\": \"^6.9.17\",\n    \"react\": \"18.2.0\",\n    \"react-native\": \"0.73.0\",\n    \"react-native-reanimated\": \"~3.6.2\",\n    \"react-native-responsive-screen\": \"^1.4.2\"\n  },\n  \"devDependencies\": {\n    \"@babel/core\": \"^7.20.0\",\n    \"@babel/preset-env\": \"^7.20.0\",\n    \"@babel/runtime\": \"^7.20.0\",\n    \"@react-native/babel-preset\": \"^0.73.18\",\n    \"@react-native/eslint-config\": \"^0.73.1\",\n    \"@react-native/metro-config\": \"^0.73.2\",\n    \"@react-native/typescript-transformer\": \"^1.2.1\",\n    \"@types/jest\": \"^29.2.1\",\n    \"@types/react\": \"^18.0.24\",\n    \"@types/react-test-renderer\": \"^18.0.0\",\n    \"babel-jest\": \"^29.2.1\",\n    \"eslint\": \"^8.19.0\",\n    \"jest\": \"^29.2.1\",\n    \"metro-react-native-babel-preset\": \"^0.73.20\",\n    \"prettier\": \"^2.4.1\",\n    \"react-test-renderer\": \"18.2.0\",\n    \"typescript\": \"^5.1.3\"\n  },\n  \"engines\": {\n    \"node\": \">=18\"\n  }\n}"
                        }
                    },
                    flutterGeneratedFiles: ["lib/main.dart", "pubspec.yaml"],
                    rnGeneratedFiles: ["App.tsx", "package.json"]
                });
            } else {
                return NextResponse.json({
                    projectTitle: "Web Application",
                    explanation: "Generated web application (fallback response due to JSON parsing issues)",
                    files: {
                        "/App.js": {
                            "code": "import React from 'react';\nimport { BrowserRouter as Router, Routes, Route } from 'react-router-dom';\nimport Header from './components/Header';\nimport Footer from './components/Footer';\nimport Home from './pages/Home';\nimport About from './pages/About';\n\nfunction App() {\n  return (\n    <Router>\n      <div className=\"min-h-screen bg-gray-50\">\n        <Header />\n        <main className=\"flex-1\">\n          <Routes>\n            <Route path=\"/\" element={<Home />} />\n            <Route path=\"/about\" element={<About />} />\n          </Routes>\n        </main>\n        <Footer />\n      </div>\n    </Router>\n  );\n}\n\nexport default App;"
                        },
                        "/components/Header.jsx": {
                            "code": "import React from 'react';\nimport { Link } from 'react-router-dom';\nimport { Menu, X } from 'lucide-react';\n\nconst Header = () => {\n  const [isMenuOpen, setIsMenuOpen] = React.useState(false);\n\n  return (\n    <header className=\"bg-white shadow-sm border-b\">\n      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">\n        <div className=\"flex justify-between items-center h-16\">\n          <Link to=\"/\" className=\"text-xl font-bold text-gray-900\">\n            Generated App\n          </Link>\n          \n          <nav className=\"hidden md:flex space-x-8\">\n            <Link to=\"/\" className=\"text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium\">\n              Home\n            </Link>\n            <Link to=\"/about\" className=\"text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium\">\n              About\n            </Link>\n          </nav>\n          \n          <button\n            className=\"md:hidden\"\n            onClick={() => setIsMenuOpen(!isMenuOpen)}\n          >\n            {isMenuOpen ? <X className=\"h-6 w-6\" /> : <Menu className=\"h-6 w-6\" />}\n          </button>\n        </div>\n        \n        {isMenuOpen && (\n          <div className=\"md:hidden\">\n            <div className=\"px-2 pt-2 pb-3 space-y-1 sm:px-3\">\n              <Link to=\"/\" className=\"block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900\">\n                Home\n              </Link>\n              <Link to=\"/about\" className=\"block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900\">\n                About\n              </Link>\n            </div>\n          </div>\n        )}\n      </div>\n    </header>\n  );\n};\n\nexport default Header;"
                        },
                        "/pages/Home.jsx": {
                            "code": "import React from 'react';\nimport { Link } from 'react-router-dom';\nimport { ArrowRight } from 'lucide-react';\n\nconst Home = () => {\n  return (\n    <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12\">\n      <div className=\"text-center\">\n        <h1 className=\"text-4xl font-bold text-gray-900 mb-6\">\n          Welcome to Our App\n        </h1>\n        <p className=\"text-xl text-gray-600 mb-8 max-w-2xl mx-auto\">\n          This is a fully functional React application with modern UI and responsive design.\n        </p>\n        <div className=\"flex justify-center space-x-4\">\n          <Link\n            to=\"/about\"\n            className=\"inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors\"\n          >\n            Learn More\n            <ArrowRight className=\"ml-2 h-5 w-5\" />\n          </Link>\n        </div>\n      </div>\n      \n      <div className=\"mt-16 grid grid-cols-1 md:grid-cols-3 gap-8\">\n        <div className=\"bg-white p-6 rounded-lg shadow-md\">\n          <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Feature 1</h3>\n          <p className=\"text-gray-600\">Description of the first feature.</p>\n        </div>\n        <div className=\"bg-white p-6 rounded-lg shadow-md\">\n          <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Feature 2</h3>\n          <p className=\"text-gray-600\">Description of the second feature.</p>\n        </div>\n        <div className=\"bg-white p-6 rounded-lg shadow-md\">\n          <h3 className=\"text-lg font-semibold text-gray-900 mb-2\">Feature 3</h3>\n          <p className=\"text-gray-600\">Description of the third feature.</p>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default Home;"
                        },
                        "/package.json": {
                            "code": "{\n  \"name\": \"generated-web-app\",\n  \"version\": \"0.0.1\",\n  \"private\": true,\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\",\n    \"preview\": \"vite preview\"\n  },\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\",\n    \"react-router-dom\": \"^6.8.0\",\n    \"lucide-react\": \"^0.263.1\",\n    \"framer-motion\": \"^10.16.4\"\n  },\n  \"devDependencies\": {\n    \"@types/react\": \"^18.2.15\",\n    \"@types/react-dom\": \"^18.2.7\",\n    \"@vitejs/plugin-react\": \"^4.0.3\",\n    \"autoprefixer\": \"^10.4.14\",\n    \"postcss\": \"^8.4.24\",\n    \"tailwindcss\": \"^3.3.2\",\n    \"vite\": \"^4.4.5\"\n  }\n}"
                        }
                    },
                    generatedFiles: ["/App.js", "/components/Header.jsx", "/pages/Home.jsx", "/package.json"]
                });
            }
        }
        
        return NextResponse.json({
            error: e.message || "Code generation failed",
            details: e.stack
        }, { status: 500 });
    }
}