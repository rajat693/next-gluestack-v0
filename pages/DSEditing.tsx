// components/DesignSystemLiveEditor.jsx
import React from "react";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import { scope } from "@/lib/scope";

const DesignSystemLiveEditor = () => {
  const defaultCode = `function Demo() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [count, setCount] = React.useState(0);

  const handleClick = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCount(count + 1);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <VStack space="md" className="p-4 bg-green-600">
      <p>Count: {count}</p>
      
      <Button onPress={handleClick} disabled={isLoading}>
        {isLoading ? (
          <ButtonSpinner />
        ) : (
          <ButtonText>Click Me</ButtonText>
        )}
      </Button>
      
      <ButtonGroup>
        <Button variant="solid">
          <ButtonText>Solid</ButtonText>
        </Button>
        <Button variant="outline">
          <ButtonText>Outline</ButtonText>
        </Button>
      </ButtonGroup>
    </VStack>
  );
}

render(<Demo />);`;

  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">
        Test Your Design System Components
      </h1>

      <LiveProvider code={defaultCode} scope={scope} noInline>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Editor */}
          <div className="border rounded overflow-hidden">
            <div className="bg-red-200 p-2 border-b">
              <h3 className="font-semibold">Edit Code</h3>
            </div>
            <LiveEditor
              className="font-mono text-sm"
              style={{
                backgroundColor: "#f5f5f5",
                fontFamily: "Menlo, monospace",
              }}
            />
          </div>

          {/* Preview */}
          <div className="border rounded overflow-hidden">
            <div className="bg-gray-100 p-2 border-b">
              <h3 className="font-semibold">Live Preview</h3>
            </div>
            <div className="p-4 bg-white">
              <LivePreview />
            </div>
          </div>
        </div>

        {/* Errors */}
        <LiveError className="bg-red-50 text-red-600 p-2 mt-4 rounded" />
      </LiveProvider>
    </div>
  );
};

export default DesignSystemLiveEditor;
