'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { ArrowUp, BarChart, Copy, Eye, Loader2, Trash } from 'lucide-react'
import Link from 'next/link'
import { Bar } from 'react-chartjs-2'
import { toast } from 'sonner'
import { deleteShortUrl, getShortUrls } from './apis/shortUrls'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const Page = () => {
  const queryClient = useQueryClient()

  const { isPending, isError, data } = useQuery({
    queryKey: ['shortUrls'],
    queryFn: async () => {
      return (await getShortUrls()).sort(
        (a: any, b: any) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
    },
  })

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      return await deleteShortUrl({
        id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shortUrls'],
      })
    },
  })

  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-slate-500">Something went wrong</p>
      </div>
    )
  }

  if (isPending) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  const getGraphData = (visits: any) => {
    if (!visits) return []

    let data: any = []
    data = visits.map((item: any) => [
      item.split('x')[0],
      Number(item.split('x')[1]),
    ])

    data =
      data.length !== 7
        ? [...data, ...Array(7 - data.length).fill(['', 0])]
        : data

    return data
  }

  return (
    <div className="mt-5 flex flex-col space-y-5">
      {data?.map((shortUrl: { id: string; url: string; visits_v2: any }) => (
        <div
          className="flex flex-col space-y-1.5 rounded-md border bg-background p-3 text-sm"
          key={shortUrl.id}
        >
          <div className="flex flex-col gap-1.5 font-mono text-xs">
            <div className="flex items-center justify-end">
              <div className="flex items-center gap-1 px-2">
                {shortUrl?.visits_v2?.length ? (
                  <>
                    {/* <ArrowUp className="h-3 w-3 text-green-500" /> */}
                    {/* <p className="flex text-green-500">
                        {getGraphData(shortUrl.visits)[0][0] ===
                        new Date().toLocaleDateString()
                          ? getGraphData(shortUrl.visits)[0][1]
                          : 0}
                      </p> */}
                  </>
                ) : (
                  ''
                )}
                {/* <Eye className="h-3 w-3 text-slate-500" />
                <p className="pt-px">
                  {shortUrl?.visits_v2?.length ? shortUrl.visits_v2.length : 0}
                </p> */}
              </div>

              <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 p-1 px-2 text-[0.6rem]">
                <Link
                  className="text-blue-500"
                  href={`/${shortUrl.id}`}
                  target="_blank"
                >
                  {process.env.NEXT_PUBLIC_APP_URL}/{shortUrl.id}
                </Link>
                <div className="h-1 w-1 rounded-full bg-slate-500/10" />
                <Copy
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${process.env.NEXT_PUBLIC_APP_URL}/${shortUrl.id}`,
                    )
                    toast.success('Copied to clipboard')
                  }}
                  className="h-3 w-3 cursor-pointer text-slate-500"
                />
                <div className="h-1 w-1 rounded-full bg-slate-500/10" />
                <AlertDialog>
                  <AlertDialogTrigger>
                    <Trash className="h-3 w-3 cursor-pointer text-red-500" />
                  </AlertDialogTrigger>
                  <AlertDialogContent className="font-mono">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-sm">
                        Do you want to delete this short URL?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs">
                        {shortUrl.id} for {shortUrl.url}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-xs">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-500 text-xs"
                        onClick={() => {
                          mutation.mutate({ id: shortUrl.id })
                          toast.info('Deleted')
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <p className="mt-0.5 line-clamp-2 break-all text-[0.65rem] text-slate-600">
              {shortUrl.url}
            </p>
          </div>

          <Accordion
            className={cn(shortUrl?.visits_v2?.length ? 'block' : 'hidden')}
            type="single"
            collapsible
          >
            <AccordionItem className="-my-4 !border-b-0" value="item-1">
              <AccordionTrigger>
                <p className="flex items-center gap-2 font-sans text-[0.6rem] font-light text-slate-500">
                  <BarChart className="h-3 w-3" />{' '}
                  {/* {shortUrl?.visits?.length
                      ? `Last visited at ${new Date(
                          shortUrl.visits[0],
                        ).toLocaleString()}, expand for more`
                      : ''} */}
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <Bar
                  data={{
                    labels: getGraphData(shortUrl.visits_v2)
                      .reverse()
                      .map((item: any) => item[0]),
                    datasets: [
                      {
                        label: 'Visits',
                        data: getGraphData(shortUrl.visits_v2)
                          .reverse()
                          .map((item: any) => item[1]),
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        position: 'right',
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  )
}

export default Page
