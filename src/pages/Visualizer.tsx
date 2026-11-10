import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, RotateCcw, Volume2, VolumeX, 
  Cpu, Code2, BrainCircuit, Sparkles, Layers, ArrowRight, CheckCircle2, 
  HelpCircle, ChevronRight, Sliders, Zap, Info, ShieldCheck, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// Types for Algorithm Steps
interface StepMemory {
  [key: string]: any;
}

interface VisualStep {
  line: number;
  description: string;
  elements: number[] | { id: string | number; val: number | string; next?: string | number | null }[];
  highlightIndices?: number[];
  pointerIndices?: { [label: string]: number };
  sortedIndices?: number[];
  memory: StepMemory;
  stackFrames?: { name: string; args: string; returnVal?: string }[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

interface AlgorithmConfig {
  id: string;
  name: string;
  category: 'Searching' | 'Sorting' | 'Data Structures' | 'Recursion' | 'Pointers';
  timeComplexity: { best: string; avg: string; worst: string };
  spaceComplexity: string;
  description: string;
  pythonCode: string[];
  generateSteps: (customInput?: number[]) => VisualStep[];
  defaultInput: number[];
}

// Sound Synthesizer via Web Audio API
class VisualizerSynth {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(frequency: number, duration: number = 0.08, type: OscillatorType = 'sine') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted
    }
  }

  compareSound(index: number) {
    this.playTone(280 + index * 40, 0.05, 'triangle');
  }

  swapSound(index: number) {
    this.playTone(520 + index * 30, 0.09, 'sine');
  }

  successSound() {
    this.playTone(659, 0.1, 'sine');
    setTimeout(() => this.playTone(880, 0.2, 'sine'), 100);
  }
}

const synth = new VisualizerSynth();

// Algorithm Definitions
const ALGORITHMS: AlgorithmConfig[] = [
  {
    id: 'binary-search',
    name: 'Binary Search (Logarithmic Mastery)',
    category: 'Searching',
    timeComplexity: { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)' },
    spaceComplexity: 'O(1)',
    description: 'Divides the search interval in half repeatedly to locate target in sorted data in milliseconds.',
    defaultInput: [3, 9, 14, 22, 38, 45, 59, 71, 84, 96],
    pythonCode: [
      'def binary_search(arr, target):',
      '    low = 0',
      '    high = len(arr) - 1',
      '    while low <= high:',
      '        mid = (low + high) // 2',
      '        if arr[mid] == target:',
      '            return mid  # Target found!',
      '        elif arr[mid] < target:',
      '            low = mid + 1',
      '        else:',
      '            high = mid - 1',
      '    return -1  # Target not found'
    ],
    generateSteps: (input?: number[]) => {
      const arr = input && input.length >= 4 ? [...input].sort((a, b) => a - b) : [3, 9, 14, 22, 38, 45, 59, 71, 84, 96];
      const target = arr[Math.floor(arr.length * 0.7)]; // search for element near right
      const steps: VisualStep[] = [];

      let low = 0;
      let high = arr.length - 1;

      steps.push({
        line: 1,
        description: `Initialize search for target = ${target} across sorted array of ${arr.length} elements.`,
        elements: [...arr],
        memory: { target, low: 'undefined', high: 'undefined', mid: 'undefined' }
      });

      steps.push({
        line: 2,
        description: `Set pointer low = 0 at start of search boundary.`,
        elements: [...arr],
        pointerIndices: { low: 0 },
        memory: { target, low: 0, high: 'undefined', mid: 'undefined' }
      });

      steps.push({
        line: 3,
        description: `Set pointer high = ${high} at end index of search space.`,
        elements: [...arr],
        pointerIndices: { low: 0, high },
        memory: { target, low: 0, high, mid: 'undefined' }
      });

      let iteration = 0;
      while (low <= high) {
        iteration++;
        const mid = Math.floor((low + high) / 2);

        steps.push({
          line: 4,
          description: `Loop condition check: low (${low}) <= high (${high}) is True. Search continues.`,
          elements: [...arr],
          pointerIndices: { low, high },
          memory: { target, low, high, mid: 'calculating...' }
        });

        steps.push({
          line: 5,
          description: `Compute midpoint: mid = (${low} + ${high}) // 2 = ${mid}. Looking at value ${arr[mid]}.`,
          elements: [...arr],
          pointerIndices: { low, mid, high },
          highlightIndices: [mid],
          memory: { target, low, high, mid, 'arr[mid]': arr[mid] },
          quiz: iteration === 1 ? {
            question: `At mid index ${mid}, value is ${arr[mid]}. Since target is ${target}, which direction will the search jump?`,
            options: [
              `Target ${target} > ${arr[mid]}, so search moves to Right half`,
              `Target ${target} < ${arr[mid]}, so search moves to Left half`,
              `Search terminates immediately`
            ],
            correctIndex: target > arr[mid] ? 0 : 1,
            explanation: `Binary search compares target with arr[mid]. Since ${target} ${target > arr[mid] ? '>' : '<'} ${arr[mid]}, we safely discard the opposite half!`
          } : undefined
        });

        steps.push({
          line: 6,
          description: `Compare: arr[${mid}] (${arr[mid]}) == target (${target}) -> ${arr[mid] === target ? 'MATCH FOUND!' : 'False'}.`,
          elements: [...arr],
          pointerIndices: { low, mid, high },
          highlightIndices: [mid],
          memory: { target, low, high, mid, 'arr[mid]': arr[mid], match: arr[mid] === target }
        });

        if (arr[mid] === target) {
          steps.push({
            line: 7,
            description: `Match verified! Returning index ${mid}. Search complete in O(log n) time.`,
            elements: [...arr],
            pointerIndices: { FOUND: mid },
            sortedIndices: [mid],
            memory: { target, resultIndex: mid, status: 'Success' }
          });
          return steps;
        } else if (arr[mid] < target) {
          steps.push({
            line: 8,
            description: `Condition arr[${mid}] < ${target} is True. Target is larger, so discard left half.`,
            elements: [...arr],
            pointerIndices: { low, mid, high },
            memory: { target, low, high, mid }
          });

          low = mid + 1;
          steps.push({
            line: 9,
            description: `Shift low boundary: low = mid + 1 -> ${low}.`,
            elements: [...arr],
            pointerIndices: { low, high },
            memory: { target, low, high }
          });
        } else {
          steps.push({
            line: 10,
            description: `Condition arr[${mid}] > ${target} is True. Target is smaller, so discard right half.`,
            elements: [...arr],
            pointerIndices: { low, mid, high },
            memory: { target, low, high, mid }
          });

          high = mid - 1;
          steps.push({
            line: 11,
            description: `Shift high boundary: high = mid - 1 -> ${high}.`,
            elements: [...arr],
            pointerIndices: { low, high },
            memory: { target, low, high }
          });
        }
      }

      steps.push({
        line: 12,
        description: `low > high. Search interval exhausted. Target ${target} is not in array.`,
        elements: [...arr],
        memory: { target, result: -1 }
      });

      return steps;
    }
  },
  {
    id: 'bubble-sort',
    name: 'Bubble Sort (Visual Swaps & Inversions)',
    category: 'Sorting',
    timeComplexity: { best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)' },
    spaceComplexity: 'O(1)',
    description: 'Repeatedly steps through the list, compares adjacent elements, and bubbles the largest item to the top.',
    defaultInput: [48, 12, 85, 34, 19, 67, 23],
    pythonCode: [
      'def bubble_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n):',
      '        swapped = False',
      '        for j in range(0, n - i - 1):',
      '            if arr[j] > arr[j + 1]:',
      '                arr[j], arr[j + 1] = arr[j + 1], arr[j]',
      '                swapped = True',
      '        if not swapped: break',
      '    return arr'
    ],
    generateSteps: (input?: number[]) => {
      const arr = input && input.length >= 4 ? [...input] : [48, 12, 85, 34, 19, 67, 23];
      const n = arr.length;
      const steps: VisualStep[] = [];
      const sortedIdxs: number[] = [];

      steps.push({
        line: 1,
        description: `Initialize Bubble Sort on array with ${n} elements.`,
        elements: [...arr],
        memory: { n, i: 'none', j: 'none', swapped: false }
      });

      for (let i = 0; i < n; i++) {
        let swapped = false;
        steps.push({
          line: 3,
          description: `Outer loop pass i = ${i}. Bubbling next largest unsorted element.`,
          elements: [...arr],
          sortedIndices: [...sortedIdxs],
          memory: { i, n, swapped: false }
        });

        for (let j = 0; j < n - i - 1; j++) {
          const willSwap = arr[j] > arr[j + 1];

          steps.push({
            line: 5,
            description: `Inner loop j = ${j}: Comparing arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]}).`,
            elements: [...arr],
            highlightIndices: [j, j + 1],
            pointerIndices: { 'j': j, 'j+1': j + 1 },
            sortedIndices: [...sortedIdxs],
            memory: { i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1], willSwap },
            quiz: (i === 0 && j === 1) ? {
              question: `Comparing arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}). Should they be swapped?`,
              options: [
                willSwap ? 'Yes, because left element is greater' : 'No, left is already smaller or equal',
                willSwap ? 'No, they are in correct order' : 'Yes, bubble sort always swaps'
              ],
              correctIndex: 0,
              explanation: `Bubble sort sorts ascendingly; whenever arr[j] > arr[j+1], we swap them to move larger values to the right.`
            } : undefined
          });

          if (willSwap) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
            swapped = true;

            steps.push({
              line: 6,
              description: `Swapped: [${arr[j + 1]}, ${arr[j]}] -> [${arr[j]}, ${arr[j + 1]}].`,
              elements: [...arr],
              highlightIndices: [j, j + 1],
              pointerIndices: { 'swapped': j + 1 },
              sortedIndices: [...sortedIdxs],
              memory: { i, j, swapped: true }
            });
          }
        }

        sortedIdxs.unshift(n - i - 1);
        steps.push({
          line: 8,
          description: `Pass ${i} complete. Element at index ${n - i - 1} (${arr[n - i - 1]}) is now permanently sorted!`,
          elements: [...arr],
          sortedIndices: [...sortedIdxs],
          memory: { i, lockedIndex: n - i - 1, totalSorted: sortedIdxs.length }
        });

        if (!swapped) {
          steps.push({
            line: 9,
            description: `Early exit triggered: No swaps occurred during this pass. Array is fully sorted!`,
            elements: [...arr],
            sortedIndices: Array.from({ length: n }, (_, k) => k),
            memory: { status: 'Optimal Termination', totalSteps: steps.length }
          });
          break;
        }
      }

      return steps;
    }
  },
  {
    id: 'recursion-fib',
    name: 'Recursion & Call Stack Tree (Fibonacci)',
    category: 'Recursion',
    timeComplexity: { best: 'O(2ⁿ)', avg: 'O(2ⁿ)', worst: 'O(2ⁿ)' },
    spaceComplexity: 'O(n) Call Stack',
    description: 'Visualizes function execution frames pushed onto the system call stack and resolving return values.',
    defaultInput: [4],
    pythonCode: [
      'def fib(n):',
      '    # Base cases',
      '    if n <= 0: return 0',
      '    if n == 1: return 1',
      '    # Recursive call stack branch',
      '    left = fib(n - 1)',
      '    right = fib(n - 2)',
      '    return left + right'
    ],
    generateSteps: () => {
      const steps: VisualStep[] = [];

      steps.push({
        line: 1,
        description: 'Call initial function fib(4). New stack frame allocated on Call Stack.',
        elements: [4],
        memory: { n: 4 },
        stackFrames: [{ name: 'fib', args: 'n=4' }]
      });

      steps.push({
        line: 5,
        description: 'fib(4) branches left: invokes fib(3). Push frame to stack.',
        elements: [4, 3],
        memory: { currentCall: 'fib(3)', parent: 'fib(4)' },
        stackFrames: [
          { name: 'fib', args: 'n=4' },
          { name: 'fib', args: 'n=3' }
        ]
      });

      steps.push({
        line: 5,
        description: 'fib(3) branches left: invokes fib(2). Push frame to stack.',
        elements: [4, 3, 2],
        memory: { currentCall: 'fib(2)', depth: 3 },
        stackFrames: [
          { name: 'fib', args: 'n=4' },
          { name: 'fib', args: 'n=3' },
          { name: 'fib', args: 'n=2' }
        ]
      });

      steps.push({
        line: 5,
        description: 'fib(2) branches left: invokes fib(1). Base case reached!',
        elements: [4, 3, 2, 1],
        memory: { currentCall: 'fib(1)', baseCase: true },
        stackFrames: [
          { name: 'fib', args: 'n=4' },
          { name: 'fib', args: 'n=3' },
          { name: 'fib', args: 'n=2' },
          { name: 'fib', args: 'n=1', returnVal: '1' }
        ]
      });

      steps.push({
        line: 3,
        description: 'fib(1) hits base case line 3: returns 1! Frame popped from stack.',
        elements: [4, 3, 2],
        memory: { 'fib(1)': 1, resolving: 'fib(2)' },
        stackFrames: [
          { name: 'fib', args: 'n=4' },
          { name: 'fib', args: 'n=3' },
          { name: 'fib', args: 'n=2 (left=1)' }
        ]
      });

      steps.push({
        line: 6,
        description: 'fib(2) branches right: invokes fib(0). Hits base case 0!',
        elements: [4, 3, 2, 0],
        memory: { 'fib(0)': 0 },
        stackFrames: [
          { name: 'fib', args: 'n=4' },
          { name: 'fib', args: 'n=3' },
          { name: 'fib', args: 'n=2', returnVal: '1 + 0 = 1' }
        ]
      });

      steps.push({
        line: 7,
        description: 'fib(2) computes left(1) + right(0) = 1. Frame pops, returning 1 to fib(3).',
        elements: [4, 3],
        memory: { 'fib(2)': 1 },
        stackFrames: [
          { name: 'fib', args: 'n=4' },
          { name: 'fib', args: 'n=3 (left=1)' }
        ]
      });

      steps.push({
        line: 6,
        description: 'fib(3) now branches right: invokes fib(1). Base case returns 1.',
        elements: [4, 3, 1],
        memory: { 'fib(1)': 1 },
        stackFrames: [
          { name: 'fib', args: 'n=4' },
          { name: 'fib', args: 'n=3 (left=1, right=1)', returnVal: '2' }
        ]
      });

      steps.push({
        line: 7,
        description: 'fib(3) computes left(1) + right(1) = 2. Returning 2 to fib(4).',
        elements: [4],
        memory: { 'fib(3)': 2 },
        stackFrames: [
          { name: 'fib', args: 'n=4 (left=2)' }
        ]
      });

      steps.push({
        line: 6,
        description: 'fib(4) now branches right: invokes fib(2) which evaluates to 1.',
        elements: [4, 2],
        memory: { 'fib(2)': 1 },
        stackFrames: [
          { name: 'fib', args: 'n=4 (left=2, right=1)', returnVal: '3' }
        ]
      });

      steps.push({
        line: 7,
        description: 'Final Return: fib(4) computes left(2) + right(1) = 3! Stack is empty.',
        elements: [3],
        memory: { finalAnswer: 3, 'fib(4)': 3, callStackDepth: '0 frames' },
        stackFrames: []
      });

      return steps;
    }
  },
  {
    id: 'two-pointers',
    name: 'Two Pointers (Target Sum Squeeze)',
    category: 'Pointers',
    timeComplexity: { best: 'O(1)', avg: 'O(n)', worst: 'O(n)' },
    spaceComplexity: 'O(1)',
    description: 'Converges two directional pointers inwards from both ends to solve Two-Sum in linear O(n) time.',
    defaultInput: [2, 5, 8, 11, 15, 19, 24, 30],
    pythonCode: [
      'def two_sum_sorted(arr, target):',
      '    left = 0',
      '    right = len(arr) - 1',
      '    while left < right:',
      '        current_sum = arr[left] + arr[right]',
      '        if current_sum == target:',
      '            return (left, right)  # Pair found!',
      '        elif current_sum < target:',
      '            left += 1  # Need larger sum',
      '        else:',
      '            right -= 1  # Need smaller sum',
      '    return None'
    ],
    generateSteps: (input?: number[]) => {
      const arr = input && input.length >= 4 ? [...input].sort((a, b) => a - b) : [2, 5, 8, 11, 15, 19, 24, 30];
      const target = 26; // 11 + 15
      const steps: VisualStep[] = [];

      let left = 0;
      let right = arr.length - 1;

      steps.push({
        line: 1,
        description: `Start Two-Pointer search for target pair summing to ${target}.`,
        elements: [...arr],
        memory: { target, left: 'init', right: 'init' }
      });

      steps.push({
        line: 2,
        description: `Initialize pointer left = 0 (points to smallest element ${arr[0]}).`,
        elements: [...arr],
        pointerIndices: { left: 0 },
        memory: { target, left: 0 }
      });

      steps.push({
        line: 3,
        description: `Initialize pointer right = ${right} (points to largest element ${arr[right]}).`,
        elements: [...arr],
        pointerIndices: { left: 0, right },
        memory: { target, left: 0, right }
      });

      while (left < right) {
        const currentSum = arr[left] + arr[right];

        steps.push({
          line: 4,
          description: `Compute sum: arr[${left}] (${arr[left]}) + arr[${right}] (${arr[right]}) = ${currentSum}. Target is ${target}.`,
          elements: [...arr],
          highlightIndices: [left, right],
          pointerIndices: { left, right },
          memory: { left, right, 'arr[left]': arr[left], 'arr[right]': arr[right], currentSum, target },
          quiz: (left === 0 && right === arr.length - 1) ? {
            question: `Current sum is ${currentSum}, but target is ${target}. How should pointers adjust?`,
            options: [
              currentSum > target ? `Sum ${currentSum} is too high, move right pointer left` : `Sum is too low, move left pointer right`,
              `Both pointers jump randomly`,
              `Terminate without finding solution`
            ],
            correctIndex: 0,
            explanation: `Since the array is sorted, moving the right pointer inward reduces the total sum, while moving the left pointer inward increases it!`
          } : undefined
        });

        if (currentSum === target) {
          steps.push({
            line: 6,
            description: `BINGO! arr[${left}] (${arr[left]}) + arr[${right}] (${arr[right]}) == ${target}! Match located in linear time!`,
            elements: [...arr],
            highlightIndices: [left, right],
            sortedIndices: [left, right],
            pointerIndices: { 'FOUND_1': left, 'FOUND_2': right },
            memory: { pairIndices: [left, right], values: [arr[left], arr[right]], status: 'Target Matched!' }
          });
          return steps;
        } else if (currentSum < target) {
          steps.push({
            line: 8,
            description: `Current sum ${currentSum} < ${target}. Move left pointer right to increase sum.`,
            elements: [...arr],
            pointerIndices: { left, right },
            memory: { currentSum, action: 'left += 1' }
          });
          left++;
        } else {
          steps.push({
            line: 10,
            description: `Current sum ${currentSum} > ${target}. Move right pointer left to decrease sum.`,
            elements: [...arr],
            pointerIndices: { left, right },
            memory: { currentSum, action: 'right -= 1' }
          });
          right--;
        }
      }

      return steps;
    }
  },
  {
    id: 'stack-queue',
    name: 'Stack & Queue Memory Visualizer (LIFO vs FIFO)',
    category: 'Data Structures',
    timeComplexity: { best: 'O(1)', avg: 'O(1)', worst: 'O(1)' },
    spaceComplexity: 'O(n)',
    description: 'Visualizes push/pop on Call Stacks (Last-In-First-Out) versus enqueue/dequeue in Task Queues.',
    defaultInput: [10, 25, 40, 55],
    pythonCode: [
      '# Stack (LIFO: Last In, First Out)',
      'stack = []',
      'stack.append(10)  # Push',
      'stack.append(25)  # Push',
      'stack.append(40)  # Push',
      'top_item = stack.pop()  # Pops 40',
      'stack.append(55)  # Push',
      'next_item = stack.pop() # Pops 55'
    ],
    generateSteps: () => {
      const steps: VisualStep[] = [];

      steps.push({
        line: 1,
        description: 'Initialize empty memory Stack [] in system heap.',
        elements: [],
        memory: { stackSize: 0, top: 'None' }
      });

      steps.push({
        line: 2,
        description: 'Push 10 onto stack. stack.append(10).',
        elements: [10],
        pointerIndices: { TOP: 0 },
        memory: { stackSize: 1, top: 10 }
      });

      steps.push({
        line: 3,
        description: 'Push 25 onto stack. stack.append(25). Top pointer moves up.',
        elements: [10, 25],
        pointerIndices: { TOP: 1 },
        memory: { stackSize: 2, top: 25 }
      });

      steps.push({
        line: 4,
        description: 'Push 40 onto stack. stack.append(40).',
        elements: [10, 25, 40],
        pointerIndices: { TOP: 2 },
        memory: { stackSize: 3, top: 40 }
      });

      steps.push({
        line: 5,
        description: 'Execute stack.pop(): Last item inserted (40) is popped out first (LIFO)!',
        elements: [10, 25],
        pointerIndices: { TOP: 1 },
        memory: { poppedItem: 40, remainingSize: 2, top: 25 }
      });

      steps.push({
        line: 6,
        description: 'Push 55 onto stack. stack.append(55).',
        elements: [10, 25, 55],
        pointerIndices: { TOP: 2 },
        memory: { stackSize: 3, top: 55 }
      });

      steps.push({
        line: 7,
        description: 'Execute stack.pop(): Most recent item (55) is removed instantly in O(1) time.',
        elements: [10, 25],
        pointerIndices: { TOP: 1 },
        memory: { poppedItem: 55, remainingSize: 2, top: 25 }
      });

      return steps;
    }
  }
];

export default function Visualizer({ addXP }: { addXP?: (amount: number) => void }) {
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>('binary-search');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000); // ms per step
  const [customInputText, setCustomInputText] = useState<string>('');
  const [customInputActive, setCustomInputActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [earnedXPMessage, setEarnedXPMessage] = useState<string | null>(null);

  const activeAlgo = useMemo(() => {
    return ALGORITHMS.find(a => a.id === selectedAlgoId) || ALGORITHMS[0];
  }, [selectedAlgoId]);

  // Parse custom input
  const parsedCustomNumbers = useMemo(() => {
    if (!customInputActive || !customInputText.trim()) return undefined;
    const nums = customInputText
      .split(/[\s,]+/)
      .map(n => parseInt(n.trim(), 10))
      .filter(n => !isNaN(n));
    return nums.length >= 4 ? nums.slice(0, 12) : undefined;
  }, [customInputActive, customInputText]);

  // Generate Steps
  const steps = useMemo(() => {
    return activeAlgo.generateSteps(parsedCustomNumbers);
  }, [activeAlgo, parsedCustomNumbers]);

  const currentStep: VisualStep = steps[currentStepIndex] || steps[0];

  // Sync Audio Synthesizer
  useEffect(() => {
    synth.enabled = soundEnabled;
  }, [soundEnabled]);

  // Play audio cues on step change
  useEffect(() => {
    if (!soundEnabled || !currentStep) return;
    if (currentStep.sortedIndices && currentStep.sortedIndices.length > 0) {
      synth.successSound();
    } else if (currentStep.pointerIndices?.['swapped']) {
      synth.swapSound(currentStep.pointerIndices['swapped']);
    } else if (currentStep.highlightIndices && currentStep.highlightIndices.length > 0) {
      synth.compareSound(currentStep.highlightIndices[0]);
    }
  }, [currentStepIndex, soundEnabled, currentStep]);

  // Step ticker
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, playbackSpeed]);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setQuizAnswered(false);
    setQuizSelectedOption(null);
  };

  const handleSelectAlgo = (id: string) => {
    setSelectedAlgoId(id);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setQuizAnswered(false);
    setQuizSelectedOption(null);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    if (quizAnswered) return;
    setQuizSelectedOption(optionIdx);
    setQuizAnswered(true);

    if (currentStep.quiz && optionIdx === currentStep.quiz.correctIndex) {
      synth.successSound();
      if (addXP) {
        addXP(25);
        setEarnedXPMessage('+25 XP earned! Correct prediction!');
        setTimeout(() => setEarnedXPMessage(null), 3500);
      }
    }
  };

  // Find max value in current elements for height scaling
  const maxVal = useMemo(() => {
    if (!currentStep.elements || currentStep.elements.length === 0) return 100;
    const nums = currentStep.elements
      .map(e => (typeof e === 'number' ? e : typeof e.val === 'number' ? e.val : 50));
    return Math.max(...nums, 10);
  }, [currentStep]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0A0A0B] text-slate-100 overflow-y-auto custom-scrollbar">
      {/* Top Banner / Header */}
      <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white tracking-tight">Python AlgoVision & Memory Tracer</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Live Time Machine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive step-by-step memory pointer, recursion call stack & visual algorithm simulator
            </p>
          </div>
        </div>

        {/* Algorithm Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/40 rounded-2xl border border-white/10">
          {ALGORITHMS.map(algo => (
            <button
              key={algo.id}
              onClick={() => handleSelectAlgo(algo.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
                selectedAlgoId === algo.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <span>{algo.name.split(' (')[0]}</span>
            </button>
          ))}
        </div>

        {/* Audio Toggle & XP Badge */}
        <div className="flex items-center gap-3">
          {earnedXPMessage && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl shadow-lg shadow-emerald-500/10 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              {earnedXPMessage}
            </motion.div>
          )}

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              "p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-medium",
              soundEnabled
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            )}
            title={soundEnabled ? "Mute audio cues" : "Enable sound synthesis"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? "Sound On" : "Muted"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Visual Canvas & Playback (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Main Visualizer Stage */}
          <div className="rounded-[2rem] bg-gradient-to-b from-slate-900/90 to-black border border-white/10 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Stage Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  {activeAlgo.category} Visualization
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight">{activeAlgo.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                  Step {currentStepIndex + 1} / {steps.length}
                </span>
              </div>
            </div>

            {/* The Visual Arena */}
            <div className="min-h-[220px] sm:min-h-[260px] flex flex-col justify-end items-center pb-4 pt-8 px-2 bg-black/40 rounded-2xl border border-white/5 relative">
              
              {/* Stack Frame / Recursion View (if active) */}
              {currentStep.stackFrames && currentStep.stackFrames.length > 0 ? (
                <div className="w-full flex flex-col gap-2 p-4">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Call Stack Memory (Top = Active Frame)</span>
                    <span className="text-cyan-400">{currentStep.stackFrames.length} Frames Pushed</span>
                  </div>
                  <div className="flex flex-col-reverse gap-2">
                    {currentStep.stackFrames.map((frame, i) => (
                      <motion.div
                        key={i}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-between font-mono text-sm shadow-md transition-all",
                          i === currentStep.stackFrames!.length - 1
                            ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30"
                            : "bg-white/5 border-white/10 text-slate-400"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold">{frame.name}({frame.args})</span>
                        </div>
                        {frame.returnVal && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                            Returns: {frame.returnVal}
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Array Bars / Nodes View */
                <div className="w-full flex items-end justify-center gap-2 sm:gap-3 h-48 px-2">
                  {currentStep.elements.map((el, idx) => {
                    const val = typeof el === 'number' ? el : (typeof el.val === 'number' ? el.val : 30);
                    const isHighlighted = currentStep.highlightIndices?.includes(idx);
                    const isSorted = currentStep.sortedIndices?.includes(idx);
                    const heightPercent = Math.max(18, Math.round((val / maxVal) * 100));

                    // Check which pointers point here
                    const activePointers = Object.entries(currentStep.pointerIndices || {})
                      .filter(([_, ptrIdx]) => ptrIdx === idx)
                      .map(([label]) => label);

                    return (
                      <div key={idx} className="flex-1 max-w-[54px] flex flex-col items-center gap-2">
                        {/* Pointers Above Bar */}
                        <div className="h-6 flex flex-col items-center justify-end">
                          {activePointers.length > 0 && (
                            <motion.div
                              layoutId={`ptr-${activePointers[0]}`}
                              className={cn(
                                "text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-lg",
                                activePointers[0].includes('FOUND')
                                  ? "bg-emerald-500 text-black font-black animate-bounce"
                                  : isHighlighted
                                  ? "bg-amber-400 text-black"
                                  : "bg-cyan-400 text-black"
                              )}
                            >
                              {activePointers.join(',')}
                            </motion.div>
                          )}
                        </div>

                        {/* Animated Bar */}
                        <motion.div
                          layout
                          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                          style={{ height: `${heightPercent}%` }}
                          className={cn(
                            "w-full rounded-t-xl flex flex-col justify-between items-center py-2 transition-all duration-200 border-t-2",
                            isSorted
                              ? "bg-gradient-to-t from-emerald-600/40 to-emerald-400 border-emerald-300 shadow-lg shadow-emerald-500/20 text-white"
                              : isHighlighted
                              ? "bg-gradient-to-t from-amber-600/50 to-amber-400 border-amber-300 shadow-lg shadow-amber-500/30 text-black font-extrabold scale-105"
                              : "bg-gradient-to-t from-slate-800 to-slate-700/80 border-cyan-500/30 text-slate-300 hover:border-cyan-400"
                          )}
                        >
                          <span className="text-xs font-bold">{val}</span>
                        </motion.div>

                        {/* Array Index Below */}
                        <span className="text-[10px] font-mono text-slate-500">[{idx}]</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step Explanation Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-cyan-100 leading-snug">
                  {currentStep.description}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-cyan-400/80 font-mono">
                  <span>Executing Line {currentStep.line}</span>
                  <span>•</span>
                  <span>Time Complexity: {activeAlgo.timeComplexity.avg}</span>
                </div>
              </div>
            </div>

            {/* Playback Controls (Time Machine) */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
                  title="Reset to Start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors disabled:opacity-40"
                  title="Step Backward (Time Travel)"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                  <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={currentStepIndex === steps.length - 1}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors disabled:opacity-40"
                  title="Step Forward"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-3 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400 font-medium">Speed:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-cyan-400 focus:outline-none cursor-pointer"
                >
                  <option value={2000} className="bg-slate-900 text-white">0.5x (Slow)</option>
                  <option value={1000} className="bg-slate-900 text-white">1.0x (Normal)</option>
                  <option value={500} className="bg-slate-900 text-white">2.0x (Fast)</option>
                  <option value={200} className="bg-slate-900 text-white">5.0x (Turbo)</option>
                </select>
              </div>
            </div>

            {/* Custom Input Drawer Toggle */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={() => setCustomInputActive(!customInputActive)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
              >
                <span>{customInputActive ? 'Hide Custom Input' : 'Type Custom Array Data'}</span>
                <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", customInputActive && "rotate-90")} />
              </button>
              <span className="text-[11px] text-slate-500 font-mono">
                {activeAlgo.category} • Space: {activeAlgo.spaceComplexity}
              </span>
            </div>

            {customInputActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-4 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="text"
                  placeholder="e.g. 5, 23, 11, 48, 9, 32"
                  value={customInputText}
                  onChange={(e) => setCustomInputText(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  onClick={() => {
                    handleReset();
                    setQuizAnswered(false);
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  Apply & Visualize
                </button>
              </motion.div>
            )}
          </div>

          {/* Interactive Prediction Quiz / Challenge Card */}
          {currentStep.quiz && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-[2rem] bg-gradient-to-br from-indigo-950/60 to-purple-950/40 border border-indigo-500/30 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                  Interactive Predictor Challenge (+25 XP)
                </span>
              </div>
              <h3 className="text-base font-bold text-white mb-4">
                {currentStep.quiz.question}
              </h3>
              <div className="grid grid-cols-1 gap-2.5">
                {currentStep.quiz.options.map((opt, i) => {
                  const isSelected = quizSelectedOption === i;
                  const isCorrect = i === currentStep.quiz!.correctIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuizAnswer(i)}
                      disabled={quizAnswered}
                      className={cn(
                        "p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between",
                        !quizAnswered
                          ? "bg-white/5 border-white/10 text-slate-200 hover:bg-indigo-500/20 hover:border-indigo-400"
                          : isCorrect
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold"
                          : isSelected
                          ? "bg-red-500/20 border-red-400 text-red-200"
                          : "bg-white/5 border-white/5 text-slate-500 opacity-60"
                      )}
                    >
                      <span>{opt}</span>
                      {quizAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {quizAnswered && (
                <div className="mt-3 text-xs text-indigo-200/90 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                  <span className="font-bold text-indigo-300">Insight: </span>
                  {currentStep.quiz.explanation}
                </div>
              )}
            </motion.div>
          )}

          {/* Big-O Complexity Radar */}
          <div className="p-6 rounded-[2rem] bg-slate-900/60 border border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Best Time</span>
              <p className="text-base font-bold text-emerald-400 font-mono mt-1">{activeAlgo.timeComplexity.best}</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Average Time</span>
              <p className="text-base font-bold text-cyan-400 font-mono mt-1">{activeAlgo.timeComplexity.avg}</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Worst Time</span>
              <p className="text-base font-bold text-amber-400 font-mono mt-1">{activeAlgo.timeComplexity.worst}</p>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Space Usage</span>
              <p className="text-base font-bold text-purple-400 font-mono mt-1">{activeAlgo.spaceComplexity}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Code Sync & Memory Inspector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Synchronized Python Code Panel */}
          <div className="rounded-[2rem] bg-slate-950 border border-white/10 p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Live Python Code Sync</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono uppercase bg-white/5 px-2 py-0.5 rounded">
                Line {currentStep.line}
              </span>
            </div>

            {/* Code Lines with Current Line Highlight */}
            <div className="font-mono text-xs overflow-x-auto p-2 bg-black/60 rounded-xl border border-white/5 flex flex-col gap-0.5">
              {activeAlgo.pythonCode.map((codeLine, idx) => {
                const lineNum = idx + 1;
                const isCurrentLine = lineNum === currentStep.line;

                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-center px-2 py-1 rounded transition-colors duration-150",
                      isCurrentLine
                        ? "bg-cyan-500/20 text-cyan-200 border-l-2 border-cyan-400 font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    <span className="w-6 text-[10px] text-slate-600 select-none text-right pr-2">
                      {lineNum}
                    </span>
                    <pre className="font-mono whitespace-pre">{codeLine}</pre>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Variable & Heap Inspector */}
          <div className="rounded-[2rem] bg-slate-900/80 border border-white/10 p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">RAM / Variable Inspector</h3>
              </div>
              <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Scope: Local
              </span>
            </div>

            <div className="divide-y divide-white/5 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
              {Object.entries(currentStep.memory).map(([key, val], idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-2 text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {key}
                  </span>
                  <span className="font-bold text-cyan-300">
                    {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Architect Note */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/20 to-blue-950/20 border border-cyan-500/10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Designed & Engineered by Muhammad Ahmad Shahid</p>
              <p className="text-[10px] text-slate-400">Master Python DSA with interactive memory inspection & zero guesswork</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
