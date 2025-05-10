const colors = {
  'deep-purple-accent-400': '#7e57c2',
  'deep-purple-accent-700': '#512da8',
  'light-green': '#006833',
  'lighter-green': '#BDFFB4',
  "primary-green": "#006833",
  "secondary-green": "#D6F8D1",
  "text-green": "#006833",
  background: {
    DEFAULT: 'hsl(var(--background))',
    primary: 'hsl(var(--background-primary))',
    secondary: 'hsl(var(--background-secondary))',
  },
  foreground: {
    DEFAULT: 'hsl(var(--foreground))',
    primary: 'hsl(var(--foreground-primary))',
  },
  card: {
    DEFAULT: 'hsl(var(--card))',
    foreground: 'hsl(var(--card-foreground))'
  },
  popover: {
    DEFAULT: 'hsl(var(--popover))',
    foreground: 'hsl(var(--popover-foreground))'
  },
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))'
  },
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))'
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))'
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    background: 'hsl(var(--accent-background))',
    foreground: 'hsl(var(--accent-foreground))'
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))'
  },
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  chart: {
    '1': 'hsl(var(--chart-1))',
    '2': 'hsl(var(--chart-2))',
    '3': 'hsl(var(--chart-3))',
    '4': 'hsl(var(--chart-4))',
    '5': 'hsl(var(--chart-5))'
  }
}

interface Colors {
  [key: string]: string | Colors;
}

const ThemePage: React.FC = () => {
  return (
    <ThemeColors colors={colors as Colors} />
  );
};

const ThemeColors: React.FC<{ colors: Colors }> = ({ colors }) => {
  const renderColors = (colors: Colors): JSX.Element[] => {
    return Object.entries(colors).map(([key, value]) => {
      if (typeof value === "object") {
        return (
          <div key={key} className="ml-4">
            <h4 className="font-bold">{key}</h4>
            {renderColors(value)}
          </div>
        );
      }
      return (
        <div key={key} className="flex items-center gap-2 my-2 bg-black">
          <div
            style={{ backgroundColor: value, width: "20px", height: "20px" }}
            className="border"
          />
          <span>{key}: {value}</span>
        </div>
      );
    });
  };

  return (
    <div className="p-4 bg-black text-white">
      <h2 className="text-xl font-bold">Theme Colors</h2>
      <div>{renderColors(colors)}</div>
    </div>
  );
};

export default ThemePage;
